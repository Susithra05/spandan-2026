// src/lib/liveCatalog.js
//
// festData.js still owns titles, descriptions, categories and images
// for every pass/event — those change rarely and shipping a new build
// for them is fine. PRICE and "is this still accepting registrations"
// now live in the price_catalog table instead (see migration_v7.sql),
// so the committee can edit them live from Admin → Table 3 without a
// redeploy. This module is the one place that fetches that table and
// layers it over the static festData.js values.
//
// Server-side enforcement (migration_v7.sql's trg_set_event_price /
// recompute_purchase_amount) is the actual source of truth for what
// gets CHARGED — this module only affects what's DISPLAYED and which
// buttons are enabled, so a stale/failed catalog fetch here can never
// result in someone being over- or under-charged.

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { subEventLabel } from "../data/festData";

export function catalogCode(eventId, subEvent) {
  return subEvent ? `${eventId}:${subEventLabel(subEvent)}` : eventId;
}

// ---------------------------------------------------------------
// Shared catalog store.
//
// Previously every component that called useLiveCatalog() fetched its
// own private copy exactly once on mount — so the Events tab (which
// didn't use it at all) never saw admin edits, and a page that was
// already open never saw them either. Now there is ONE module-level
// copy, fetched once, shared by every subscriber, and re-fetched:
//   - whenever the tab regains focus / becomes visible again
//   - every 60 seconds while the page is open
//   - immediately when refreshLiveCatalog() is called (Admin Table 3
//     does this right after a successful save)
// The catalog object's identity only changes when the data actually
// changed, so useMemo()s that depend on it don't recompute needlessly.
// ---------------------------------------------------------------
let store = { catalog: {}, loaded: false };
let signature = "";
let inflight = null;
const listeners = new Set();

export function refreshLiveCatalog() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.from("price_catalog").select("*");
      if (!error) {
        const map = {};
        (data || []).forEach((row) => {
          map[row.code] = row;
        });
        const sig = JSON.stringify(data || []);
        if (sig !== signature) {
          signature = sig;
          store = { catalog: map, loaded: true };
          listeners.forEach((l) => l());
          return;
        }
      }
      if (!store.loaded) {
        store = { ...store, loaded: true };
        listeners.forEach((l) => l());
      }
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

// { [code]: { price, per_person, registrations_open, title_override, desc_override } }
export function useLiveCatalog() {
  const [, force] = useState(0);

  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    refreshLiveCatalog();

    const onWake = () => {
      if (document.visibilityState !== "hidden") refreshLiveCatalog();
    };
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);
    const timer = setInterval(refreshLiveCatalog, 60000);

    return () => {
      listeners.delete(listener);
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
      clearInterval(timer);
    };
  }, []);

  return { catalog: store.catalog, loaded: store.loaded, refreshCatalog: refreshLiveCatalog };
}

// Wraps festData.js's getEventAccess() with the live catalog: feeds
// the admin-edited price INTO the existing unlock/free-with-pass math
// (so a category-level "free with Lit Pass" rule still applies
// correctly on top of whatever price the admin set), then adds a
// `registrationsOpen` flag the browse grid can check.
export function liveEventAccess(getEventAccessFn, event, ownedPassCodes, subEvent, catalog) {
  const code = catalogCode(event.id, subEvent);
  const row = catalog[code];
  if (!row) return { ...getEventAccessFn(event, ownedPassCodes, subEvent), registrationsOpen: true };

  // Sub-events are usually plain strings (price lives on the parent
  // event) and only occasionally {name, price} objects (Gymnasium).
  // getEventAccess() reads the price from whichever one carries it, so
  // patch the SAME one — patching only object sub-events meant a price
  // edit on any string sub-event (Basketball - Men's, Athletics ...)
  // was silently ignored.
  const livePrice = Number(row.price);
  let patchedEvent = event;
  let patchedSubEvent = subEvent;
  if (subEvent && typeof subEvent === "object") {
    patchedSubEvent = { ...subEvent, price: livePrice };
  } else {
    patchedEvent = { ...event, price: livePrice };
  }
  const access = getEventAccessFn(patchedEvent, ownedPassCodes, patchedSubEvent);
  return { ...access, registrationsOpen: row.registrations_open !== false };
}

export function liveEventTitle(catalog, eventId, fallbackTitle) {
  return catalog[eventId]?.title_override || fallbackTitle;
}

// A sub-event's row is keyed "eventId:OriginalLabel" — the override
// replaces just the label shown for that sub-event. The KEY stays on
// the original label so carts, DB rows and pricing lookups never break.
export function liveSubEventLabel(catalog, eventId, sub) {
  return catalog[`${eventId}:${subEventLabel(sub)}`]?.title_override || subEventLabel(sub);
}

// Full display title for a cart / review / DB entry: "Event" or
// "Event — Sub-event", with either half overridden if the admin edited it.
export function liveEntryTitle(catalog, event, sub) {
  const base = liveEventTitle(catalog, event.id, event.title);
  return sub ? `${base} — ${liveSubEventLabel(catalog, event.id, sub)}` : base;
}

// Text used by the search boxes: matches the live title as well as the
// original, so searching for either name finds the event.
export function liveEventSearchText(catalog, event) {
  return `${liveEventTitle(catalog, event.id, event.title)} ${event.title} ${liveEventDesc(catalog, event.id, event.desc) || ""}`.toLowerCase();
}

// Headline price for a top-level event card. With sub-events it's the
// lowest live sub-event price ("From ₹X" when they differ).
export function liveCardPrice(getEventAccessFn, event, ownedPassCodes, catalog) {
  if (!event.subEvents || event.subEvents.length === 0) {
    return { price: liveEventAccess(getEventAccessFn, event, ownedPassCodes, null, catalog).price, isRange: false };
  }
  const prices = event.subEvents.map((sub) => liveEventAccess(getEventAccessFn, event, ownedPassCodes, sub, catalog).price);
  const min = Math.min(...prices);
  return { price: min, isRange: prices.some((p) => p !== min) };
}

export function liveEventDesc(catalog, eventId, fallbackDesc) {
  return catalog[eventId]?.desc_override || fallbackDesc;
}

// For a top-level event card (no specific sub-event selected yet):
// "registrations closed" only if EVERY sub-event (or the event itself,
// if it has none) is closed — a single full sub-event shouldn't grey
// out the whole card when siblings are still open.
export function liveEventCardOpen(event, catalog) {
  if (!event.subEvents || event.subEvents.length === 0) {
    const row = catalog[event.id];
    return row ? row.registrations_open !== false : true;
  }
  return event.subEvents.some((sub) => {
    const row = catalog[catalogCode(event.id, sub)];
    return row ? row.registrations_open !== false : true;
  });
}

export function livePassPrice(catalog, passId, fallbackPrice) {
  const row = catalog[passId];
  return row ? Number(row.price) : fallbackPrice;
}
