// src/lib/idGenerator.js
//
// Builds the 8-character Delegate ID for a checkout, then asks the
// database to atomically hand out the next number for that prefix
// (see supabase/migration.sql -> generate_delegate_id()).
//
// Examples this produces:
//   Tier One (Red Queen) alone         -> "DT1" + 5 digits  -> DT100019
//   Cult Pass alone                    -> "CP"  + 6 digits  -> CP000001
//   Cult Pass + Sports Pass together   -> "CSP" + 5 digits  -> CSP01025
//
// RULES (documented so they're easy to adjust later):
// 1. If a Delegate Tier is in the checkout, it always determines the
//    prefix ("DT" + tier number), regardless of any club passes also
//    in the same checkout — a Tier already includes full event access,
//    so it takes priority as the person's primary identity.
// 2. Otherwise, take the set of club passes purchased *in this same
//    checkout*, map each to a single letter, sort them into a fixed
//    priority order, and join. One pass -> 2-letter prefix + 6 digits
//    (e.g. "CP" + 000001). Two or more -> first two letters + "P" for
//    "Pass" + 5 digits (e.g. "CSP" + 01025). This caps the prefix at
//    3 characters so the ID always stays exactly 8 characters, per
//    spec. If three or more distinct pass letters are ever bought in
//    one checkout, they collapse onto the same 2-letter+P prefix as
//    any other pair starting with the same two (a documented, rare
//    edge case — the ID stays unique, it just doesn't encode a third
//    pass letter).
// 3. The Premium Pass (Lit & Quiz bundle) is treated as if the user
//    bought Lit + Quiz together, i.e. it maps to letters {L, Q}.
//
// GROUP DELEGATE IDs — for members added to a checkout by a Group
// Leader, the base 8-character ID above is prefixed with a 4-character
// Group Code + hyphen, e.g. "G001-SP000001" (13 characters total).
// The Group Code itself is a separate atomic sequence (see
// generateGroupCode() below), one per group, not per member.

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

// Individual (non-group) IDs are always exactly 8 characters.
// Group IDs are always exactly 13: 4-char group code + "-" + 8-char ID.
export const DELEGATE_ID_LENGTH = 8;
export const GROUP_PREFIX_LENGTH = 4; // e.g. "G001"
export const GROUP_DELEGATE_ID_LENGTH = GROUP_PREFIX_LENGTH + 1 + DELEGATE_ID_LENGTH; // 13

export const INDIVIDUAL_ID_REGEX = /^[A-Z0-9]{8}$/;
export const GROUP_ID_REGEX = /^[A-Z][0-9]{3}-[A-Z0-9]{8}$/; // e.g. G001-SP000001
// Accepts either shape — used wherever a Delegate ID field doesn't yet
// know if it's being handed an individual or a group ID.
export const ANY_DELEGATE_ID_REGEX = /^([A-Z0-9]{8}|[A-Z][0-9]{3}-[A-Z0-9]{8})$/;

export function isGroupDelegateId(value = "") {
  return value.includes("-");
}

export function normalizeDelegateId(value = "") {
  return value.trim().toUpperCase();
}

/**
 * Given the set of pass codes purchased in one checkout, work out
 * the ID prefix and how many digits the numeric suffix should have
 * so prefix.length + digits === 8 always.
 */
export function computeIdPrefix(passCodes = []) {
  const tierCode = passCodes.find((c) => TIER_PREFIX[c]);
  if (tierCode) {
    return { prefix: TIER_PREFIX[tierCode], digits: 5 };
  }

  const letters = new Set();
  passCodes.forEach((code) => {
    const mapped = CLUB_LETTERS[code];
    if (mapped) mapped.split("").forEach((ch) => letters.add(ch));
  });

  const sorted = CLUB_PRIORITY.filter((l) => letters.has(l));

  if (sorted.length === 0) return null; // no pass in this checkout -> no ID
  if (sorted.length === 1) {
    return { prefix: `${sorted[0]}P`, digits: 6 };
  }
  return { prefix: `${sorted.slice(0, 2).join("")}P`, digits: 5 };
}

/**
 * Calls the DB to atomically reserve and return the next base
 * (non-group) Delegate ID for this checkout's pass combination.
 * Returns null if the checkout has no pass at all (events-only
 * checkout using a pass from an earlier purchase doesn't mint a new ID).
 */
export async function generateBaseDelegateId(passCodes = []) {
  const computed = computeIdPrefix(passCodes);
  if (!computed) return null;

  const { data, error } = await supabase.rpc("generate_delegate_id", {
    p_prefix: computed.prefix,
    p_digits: computed.digits,
  });

  if (error) throw error;
  return data;
}

// Back-compat alias — existing call sites (individual Pass Checkout)
// keep working unchanged.
export const generateDelegateId = generateBaseDelegateId;

/**
 * Atomically reserves a new 4-character Group Code (e.g. "G001") from
 * its own counter sequence. One call per group, not per member — every
 * member's ID is then this code + "-" + their own base ID.
 */
export async function generateGroupCode() {
  const { data, error } = await supabase.rpc("generate_group_code");
  if (error) throw error;
  return data;
}

/**
 * Builds the full 13-character Group Delegate ID for one member.
 */
export function buildGroupDelegateId(groupCode, baseId) {
  return `${groupCode}-${baseId}`;
}
