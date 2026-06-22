import type { ClientGameState, PlayerId } from "../game/types";

// PeerJS shares one global id space on the free broker, so we namespace our
// join codes to avoid colliding with unrelated apps. The user-facing code is
// the short suffix; the actual peer id is `peerIdForCode(code)`.
export const PEER_PREFIX = "oddoneout-";

export function peerIdForCode(code: string): string {
  return PEER_PREFIX + code.toUpperCase();
}

/** Messages a client sends to the host. */
export type ClientMessage =
  | { type: "hello"; playerId: PlayerId; name: string }
  | { type: "answer"; text: string }
  | { type: "vote"; accusedId: PlayerId };

/** Messages the host sends to a client. */
export type HostMessage =
  | { type: "state"; state: ClientGameState }
  | { type: "error"; reason: string };
