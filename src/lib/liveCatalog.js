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

// { [code]: { price, per_person, registrations_open, title_override, desc_override } }
export function useLiveCatalog() {
  const [catalog, setCatalog] = useState({});
  const [loaded, setLoaded] = useState(false);

  const refresh = async () => {
    const { data, error } = await supabase.from("price_catalog").select("*");
    if (!error) {
      const map = {};
      (data || []).forEach((row) => {
        map[row.code] = row;
      });
      setCatalog(map);
    }
    setLoaded(true);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("price_catalog").select("*");
      if (cancelled) return;
      if (!error) {
        const map = {};
        (data || []).forEach((row) => {
          map[row.code] = row;
        });
        setCatalog(map);
      }
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, loaded, refreshCatalog: refresh };
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

  const patchedSubEvent = subEvent && typeof subEvent === "object" ? { ...subEvent, price: Number(row.price) } : subEvent;
  const patchedEvent = subEvent ? event : { ...event, price: Number(row.price) };
  const access = getEventAccessFn(patchedEvent, ownedPassCodes, patchedSubEvent);
  return { ...access, registrationsOpen: row.registrations_open !== false };
}

export function liveEventTitle(catalog, eventId, fallbackTitle) {
  return catalog[eventId]?.title_override || fallbackTitle;
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
