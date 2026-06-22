import type {
  ClientGameState,
  GameState,
  Phase,
  Player,
  PlayerId,
  QuestionCard,
  SyntaxType,
} from "./types";
import { QUESTIONS } from "./questions";

export const MIN_PLAYERS = 3;
export const DEFAULT_TOTAL_ROUNDS = 5;

/** How long each timed phase lasts, in seconds (see GAME_DESIGN.md). */
export const DURATIONS = {
  answering: 60, // Input Phase
  discussion: 180, // List Reveal + Open Floor (2–4 min, 3 min default)
  voting: 45, // The Vote
} as const;

/** Points awarded per correct guess / per fooled player ("Jackpot" model). */
export const POINTS = 100;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function deadline(now: number, seconds: number): number {
  return now + seconds * 1000;
}

export function createGame(code: string): GameState {
  return {
    code,
    phase: "lobby",
    players: [],
    round: null,
    totalRounds: DEFAULT_TOTAL_ROUNDS,
    roundsPlayed: 0,
    phaseDeadline: null,
  };
}

export function addOrReconnectPlayer(
  state: GameState,
  id: PlayerId,
  name: string,
  isHost = false,
): GameState {
  const existing = state.players.find((p) => p.id === id);
  if (existing) {
    // Reconnection: keep score/seat, just flip connected back on (and refresh name).
    return {
      ...state,
      players: state.players.map((p) =>
        p.id === id ? { ...p, connected: true, name } : p,
      ),
    };
  }
  const player: Player = {
    id,
    name,
    connected: true,
    score: 0,
    isHost,
  };
  return { ...state, players: [...state.players, player] };
}

export function setConnected(
  state: GameState,
  id: PlayerId,
  connected: boolean,
): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === id ? { ...p, connected } : p)),
  };
}

function startRound(
  state: GameState,
  usedCardIds: Set<string>,
  now: number,
): GameState {
  const pool = QUESTIONS.filter((q) => !usedCardIds.has(q.id));
  const card: QuestionCard = pick(pool.length ? pool : QUESTIONS);
  const oddOneOut = pick(state.players);
  return {
    ...state,
    phase: "answering",
    phaseDeadline: deadline(now, DURATIONS.answering),
    round: {
      number: state.roundsPlayed + 1,
      card,
      oddOneOutId: oddOneOut.id,
      answers: [],
      votes: {},
      scored: false,
    },
  };
}

export function startGame(state: GameState, now: number): GameState {
  if (state.players.length < MIN_PLAYERS) return state;
  return startRound({ ...state, roundsPlayed: 0 }, new Set(), now);
}

export function submitAnswer(
  state: GameState,
  playerId: PlayerId,
  text: string,
): GameState {
  if (!state.round || state.phase !== "answering") return state;
  const answers = state.round.answers.filter((a) => a.playerId !== playerId);
  answers.push({ playerId, text: text.trim() });
  return { ...state, round: { ...state.round, answers } };
}

/** Have all currently-connected players submitted an answer? */
export function allAnswered(state: GameState): boolean {
  if (!state.round) return false;
  const need = state.players.filter((p) => p.connected).map((p) => p.id);
  return need.every((id) => state.round!.answers.some((a) => a.playerId === id));
}

export function goToDiscussion(state: GameState, now: number): GameState {
  if (!state.round || state.phase !== "answering") return state;
  return {
    ...state,
    phase: "discussion",
    phaseDeadline: deadline(now, DURATIONS.discussion),
  };
}

export function goToVoting(state: GameState, now: number): GameState {
  if (!state.round || state.phase !== "discussion") return state;
  return {
    ...state,
    phase: "voting",
    phaseDeadline: deadline(now, DURATIONS.voting),
  };
}

export function submitVote(
  state: GameState,
  voterId: PlayerId,
  accusedId: PlayerId,
): GameState {
  if (!state.round || state.phase !== "voting") return state;
  return {
    ...state,
    round: {
      ...state.round,
      votes: { ...state.round.votes, [voterId]: accusedId },
    },
  };
}

export function allVoted(state: GameState): boolean {
  if (!state.round) return false;
  // The odd one out doesn't vote on themselves; everyone else does.
  const voters = state.players
    .filter((p) => p.connected && p.id !== state.round!.oddOneOutId)
    .map((p) => p.id);
  return voters.every((id) => id in state.round!.votes);
}

/**
 * Score the round and move to reveal (the "Jackpot" model, see GAME_DESIGN.md).
 * - Each innocent who correctly fingered the odd one out: +POINTS.
 * - The odd one out: +POINTS for every player they fooled (who voted wrong).
 */
export function revealAndScore(state: GameState): GameState {
  if (!state.round || state.phase !== "voting") return state;

  // Already scored (e.g. re-revealed after stepping back in dev): just show it.
  if (state.round.scored) {
    return { ...state, phase: "reveal", phaseDeadline: null };
  }

  const { oddOneOutId, votes } = state.round;

  const detectives = state.players.filter((p) => p.id !== oddOneOutId);
  let foolCount = 0;
  const gained: Record<PlayerId, number> = {};
  for (const d of detectives) {
    if (votes[d.id] === oddOneOutId) {
      gained[d.id] = (gained[d.id] ?? 0) + POINTS;
    } else {
      foolCount += 1;
    }
  }
  gained[oddOneOutId] = (gained[oddOneOutId] ?? 0) + foolCount * POINTS;

  return {
    ...state,
    phase: "reveal",
    phaseDeadline: null,
    roundsPlayed: state.roundsPlayed + 1,
    round: { ...state.round, scored: true },
    players: state.players.map((p) => ({
      ...p,
      score: p.score + (gained[p.id] ?? 0),
    })),
  };
}

/** Move from the reveal screen to the round's scoring leaderboard. */
export function goToScoring(state: GameState): GameState {
  if (state.phase !== "reveal") return state;
  return { ...state, phase: "scoring" };
}

/**
 * Dev-only: jump straight to a phase without running its transition logic
 * (no scoring, no new round). Used for stepping back and forth while testing.
 */
export function devGoToPhase(
  state: GameState,
  phase: Phase,
  now: number,
): GameState {
  const secs =
    phase === "answering"
      ? DURATIONS.answering
      : phase === "discussion"
        ? DURATIONS.discussion
        : phase === "voting"
          ? DURATIONS.voting
          : null;
  return { ...state, phase, phaseDeadline: secs ? deadline(now, secs) : null };
}

export function nextRound(state: GameState, now: number): GameState {
  if (state.phase !== "scoring") return state;
  if (state.roundsPlayed >= state.totalRounds) {
    return { ...state, phase: "gameOver", round: null, phaseDeadline: null };
  }
  const usedCardIds = new Set(state.round ? [state.round.card.id] : []);
  return startRound(state, usedCardIds, now);
}

/**
 * Produce the redacted view a specific client should receive. Secrets are
 * stripped on the host so they never travel over the wire to the wrong person:
 *  - Before reveal, the real question is hidden from the odd one out (they get
 *    only the hint) and the hint is hidden from everyone else.
 *  - No one learns who the odd one out is until reveal.
 *  - Answers stay hidden until the discussion phase.
 *  - Individual votes stay hidden until reveal.
 */
export function viewFor(state: GameState, recipientId: PlayerId): ClientGameState {
  if (!state.round) return state;

  const isReveal =
    state.phase === "reveal" ||
    state.phase === "scoring" ||
    state.phase === "gameOver";
  const recipientIsOdd = state.round.oddOneOutId === recipientId;

  // Keep `syntax` in every view — all players need it to validate their input.
  // Only the question (hidden from the OOO) and the OOO prompt (hidden from
  // everyone else) are stripped before reveal.
  const card: QuestionCard = isReveal
    ? state.round.card
    : recipientIsOdd
      ? { ...state.round.card, question: "" }
      : { ...state.round.card, oooPrompt: "" };

  // During answering, keep every answer entry (so clients can show accurate
  // "X/Y submitted" progress) but blank out other players' text, since answers
  // aren't revealed until the discussion phase.
  const answers =
    state.phase === "answering"
      ? state.round.answers.map((a) =>
          a.playerId === recipientId ? a : { ...a, text: "" },
        )
      : state.round.answers;

  const votes = isReveal
    ? state.round.votes
    : recipientId in state.round.votes
      ? { [recipientId]: state.round.votes[recipientId] }
      : {};

  return {
    ...state,
    round: {
      ...state.round,
      card,
      oddOneOutId: isReveal ? state.round.oddOneOutId : recipientIsOdd ? recipientId : "",
      answers,
      votes,
    },
  };
}

// ---- Syntax enforcement (shared by the answer input UI) ----

/** A human-readable description of a syntax type, e.g. "a whole number 0–100". */
export function describeSyntax(s: SyntaxType): string {
  switch (s.kind) {
    case "integer":
      return `a whole number from ${s.min} to ${s.max}`;
    case "word":
      return "a single word";
    case "phrase":
      return "a short answer";
  }
}

/** Returns an error message if `raw` doesn't satisfy the syntax, else null. */
export function validateAnswer(s: SyntaxType, raw: string): string | null {
  const text = raw.trim();
  if (!text) return "Enter an answer";
  switch (s.kind) {
    case "integer": {
      if (!/^-?\d+$/.test(text)) return "Numbers only";
      const n = Number(text);
      if (n < s.min || n > s.max) return `Must be ${s.min}–${s.max}`;
      return null;
    }
    case "word":
      if (/\s/.test(text)) return "One word only";
      if (!/^[\p{L}'-]+$/u.test(text)) return "Letters only";
      return null;
    case "phrase":
      if (text.length > s.maxLen) return `Keep it under ${s.maxLen} characters`;
      return null;
  }
}

/** Max input length and on-screen keyboard hint for a syntax type. */
export function inputHints(s: SyntaxType): {
  maxLength: number;
  inputMode: "numeric" | "text";
} {
  switch (s.kind) {
    case "integer":
      return { maxLength: String(s.max).length + 1, inputMode: "numeric" };
    case "word":
      return { maxLength: 24, inputMode: "text" };
    case "phrase":
      return { maxLength: s.maxLen, inputMode: "text" };
  }
}
