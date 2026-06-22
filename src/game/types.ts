// Core domain model for Odd One Out.
//
// The host's device holds the single authoritative GameState. Clients render a
// (possibly redacted) copy that the host broadcasts to them. All mutations go
// through the engine on the host — clients only send PlayerActions.

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  /** Connected right now? Disconnected players keep their seat for reconnection. */
  connected: boolean;
  /** Cumulative score across rounds. */
  score: number;
  /** True only for the device that created the game. */
  isHost: boolean;
}

export type Phase =
  | "lobby" // waiting for players; host can start
  | "answering" // everyone writes an answer (odd one out only sees a hint)
  | "discussion" // answers revealed; players motivate them out loud
  | "voting" // everyone votes for who they think is the odd one out
  | "reveal" // odd one out + answers + vote tally shown
  | "scoring" // round leaderboard shown
  | "gameOver";

/**
 * The strictly-enforced format every answer in a round must conform to. This
 * keeps the odd one out's answer from sticking out by shape alone (e.g. a word
 * among numbers), so the only "tell" is the content, not the syntax.
 */
export type SyntaxType =
  | { kind: "integer"; min: number; max: number }
  | { kind: "word" } // a single word
  | { kind: "phrase"; maxLen: number }; // short free text

/** A prompt and the constraint shown to whoever is the odd one out that round. */
export interface QuestionCard {
  id: string;
  /** The real question everyone except the odd one out sees. */
  question: string;
  /** The constraint prompt the odd one out sees instead of the question. */
  oooPrompt: string;
  /** Format all answers (everyone's, including the OOO's) must satisfy. */
  syntax: SyntaxType;
}

export interface Answer {
  playerId: PlayerId;
  text: string;
}

export interface Round {
  number: number;
  card: QuestionCard;
  /** Who is secretly the odd one out this round. */
  oddOneOutId: PlayerId;
  answers: Answer[];
  /** voterId -> the player they accused of being the odd one out. */
  votes: Record<PlayerId, PlayerId>;
}

export interface GameState {
  code: string;
  phase: Phase;
  players: Player[];
  round: Round | null;
  /** Rounds to play before gameOver. */
  totalRounds: number;
  roundsPlayed: number;
  /**
   * Epoch ms when the current timed phase auto-advances, or null for untimed
   * phases (lobby, reveal, gameOver). The host owns the clock; clients render a
   * countdown against their own `Date.now()` (minor skew is fine).
   */
  phaseDeadline: number | null;
}

/**
 * The view of state a *client* receives. Identical to GameState except secrets
 * are stripped per-recipient by the host before sending (e.g. the answering
 * player only learns whether *they* are the odd one out, never who else is).
 */
export type ClientGameState = GameState;
