// src/lib/idGenerator.js
//
// Builds the 7-character Delegate ID for a checkout, then asks the
// database to atomically hand out the next number for that prefix
// (see supabase/migration.sql -> generate_delegate_id()).
//
// Examples this produces:
//   Tier One (Red Queen) alone         -> "DT1" + 4 digits  -> DT10019
//   Cult Pass alone                    -> "CP"  + 5 digits  -> CP00001
//   Cult Pass + Sports Pass together   -> "CSP" + 4 digits  -> CSP1025
//
// RULES (documented so they're easy to adjust later):
// 1. If a Delegate Tier is in the checkout, it always determines the
//    prefix ("DT" + tier number), regardless of any club passes also
//    in the same checkout — a Tier already includes full event access,
//    so it takes priority as the person's primary identity.
// 2. Otherwise, take the set of club passes purchased *in this same
//    checkout*, map each to a single letter, sort them into a fixed
//    priority order, and join. One pass -> 2-letter prefix + 5 digits
//    (e.g. "CP" + 00001). Two or more -> first two letters + "P" for
//    "Pass" + 4 digits (e.g. "CSP" + 1025). This caps the prefix at
//    3 characters so the ID always stays exactly 7 characters, per
//    spec. If three or more distinct pass letters are ever bought in
//    one checkout, they collapse onto the same 2-letter+P prefix as
//    any other pair starting with the same two (a documented, rare
//    edge case — the ID stays unique, it just doesn't encode a third
//    pass letter).
// 3. The Premium Pass (Lit & Quiz bundle) is treated as if the user
//    bought Lit + Quiz together, i.e. it maps to letters {L, Q}.

import { supabase } from "./supabase";

const TIER_PREFIX = {
  "tier-one": "DT1",
  "tier-two": "DT2",
  "tier-three": "DT3",
};

const CLUB_LETTERS = {
  "cult-pass": "C",
  "sports-pass": "S",
  "lit-pass": "L",
  "quiz-pass": "Q",
  "premium-pass": "LQ",
};

// Fixed sort order used when combining multiple club-pass letters
const CLUB_PRIORITY = ["C", "S", "L", "Q"];

/**
 * Given the set of pass codes purchased in one checkout, work out
 * the ID prefix and how many digits the numeric suffix should have
 * so prefix.length + digits === 7 always.
 */
export function computeIdPrefix(passCodes = []) {
  const tierCode = passCodes.find((c) => TIER_PREFIX[c]);
  if (tierCode) {
    return { prefix: TIER_PREFIX[tierCode], digits: 4 };
  }

  const letters = new Set();
  passCodes.forEach((code) => {
    const mapped = CLUB_LETTERS[code];
    if (mapped) mapped.split("").forEach((ch) => letters.add(ch));
  });

  const sorted = CLUB_PRIORITY.filter((l) => letters.has(l));

  if (sorted.length === 0) return null; // no pass in this checkout -> no ID
  if (sorted.length === 1) {
    return { prefix: `${sorted[0]}P`, digits: 5 };
  }
  return { prefix: `${sorted.slice(0, 2).join("")}P`, digits: 4 };
}

/**
 * Calls the DB to atomically reserve and return the next Delegate ID
 * for this checkout's pass combination. Returns null if the checkout
 * has no pass at all (events-only checkout using a pass from an
 * earlier purchase doesn't mint a new ID).
 */
export async function generateDelegateId(passCodes = []) {
  const computed = computeIdPrefix(passCodes);
  if (!computed) return null;

  const { data, error } = await supabase.rpc("generate_delegate_id", {
    p_prefix: computed.prefix,
    p_digits: computed.digits,
  });

  if (error) throw error;
  return data;
}
