import type { PlayerId } from "../game/types";

// A stable per-device identity that survives reloads and reconnections. This is
// what lets the host re-seat a returning player instead of treating them as new.

const ID_KEY = "ooo:playerId";
const NAME_KEY = "ooo:playerName";

function randomId(): string {
  return "p_" + Math.random().toString(36).slice(2, 10);
}

export function getPlayerId(): PlayerId {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

export function getStoredName(): string {
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function setStoredName(name: string): void {
  localStorage.setItem(NAME_KEY, name);
}

/** Generate a short, human-friendly join code (no ambiguous chars). */
export function generateCode(length = 4): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,0,1
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
