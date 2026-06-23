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

/** How long the fixed-length timed phases last, in seconds (see GAME_DESIGN.md). */
export const DURATIONS = {
  answering: 60, // Input Phase
  voting: 45, // The Vote
} as const;

/** Discussion scales with the table: 30s base + 30s per player. */
export function discussionSeconds(state: GameState): number {
  return 30 + 30 * state.players.length;
}

// ---- Scoring (see GAME_DESIGN.md §5) ----
/** Base points for catching the odd one out, and per player the OOO fools. */
export const POINTS = 100;
/** Added to the streak multiplier per consecutive correct catch (×1, ×1.5, …). */
export const STREAK_STEP = 0.5;
/** Multiplier for a correct voter when correct voters are a strict minority. */
export const MINORITY_MULTIPLIER = 5;
/** Multiplier for the OOO when only a minority voted for them (they evaded). */
export const OOO_EVASION_MULTIPLIER = 2;
/** Points a non-OOO player loses per vote received (suspicion penalty). */
export const SUSPICION_PENALTY = 100;

/** Streak multiplier given the consecutive-correct count *before* this catch. */
function streakMultiplier(priorStreak: number): number {
  return 1 + STREAK_STEP * priorStreak;
}

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
    usedQuestionIds: [],
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
    streak: 0,
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

function startRound(state: GameState, now: number): GameState {
  let used = state.usedQuestionIds;
  let available = QUESTIONS.filter((q) => !used.includes(q.id));
  if (available.length === 0) {
    // Every question has been featured — reset the cycle, but avoid immediately
    // repeating the one we just showed.
    const lastId = state.round?.card.id;
    used = [];
    available = QUESTIONS.filter((q) => q.id !== lastId);
  }
  const card: QuestionCard = pick(available);
  const oddOneOut = pick(state.players);
  return {
    ...state,
    usedQuestionIds: [...used, card.id],
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
  // Keep usedQuestionIds: questions don't repeat across games in the same
  // lobby until the whole deck has been cycled through.
  return startRound({ ...state, roundsPlayed: 0 }, now);
}

/** Return a finished game to its lobby, keeping players and the used-question
 * history but resetting scores. */
export function returnToLobby(state: GameState): GameState {
  if (state.phase === "lobby") return state;
  return {
    ...state,
    phase: "lobby",
    round: null,
    phaseDeadline: null,
    roundsPlayed: 0,
    players: state.players.map((p) => ({ ...p, score: 0, streak: 0 })),
  };
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
    phaseDeadline: deadline(now, discussionSeconds(state)),
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
 * Score the round and move to reveal (see GAME_DESIGN.md §5).
 *
 * Detectives: catching the OOO pays POINTS × streak × minority. Each vote you
 * receive costs SUSPICION_PENALTY; receiving a majority of votes zeroes your
 * round. The OOO earns POINTS per fooled voter, doubled if only a minority
 * caught them. Cumulative scores never drop below 0.
 */
export function revealAndScore(state: GameState): GameState {
  if (!state.round || state.phase !== "voting") return state;

  // Already scored (e.g. re-revealed after stepping back in dev): just show it.
  if (state.round.scored) {
    return { ...state, phase: "reveal", phaseDeadline: null };
  }

  const { oddOneOutId, votes } = state.round;

  // Votes cast (the OOO doesn't vote), who was correct, and tallies received.
  const voterIds = Object.keys(votes);
  const totalVotes = voterIds.length;
  const correctVotes = voterIds.filter((id) => votes[id] === oddOneOutId).length;
  // A strict minority of voters caught the OOO → minority/evasion bonuses apply.
  const minorityCaught = totalVotes > 0 && correctVotes * 2 < totalVotes;

  const votesReceived: Record<PlayerId, number> = {};
  for (const id of voterIds) {
    const target = votes[id];
    votesReceived[target] = (votesReceived[target] ?? 0) + 1;
  }

  const players = state.players.map((p) => {
    const received = votesReceived[p.id] ?? 0;

    if (p.id === oddOneOutId) {
      // OOO: paid per voter they fooled, ×2 if they evaded the majority.
      const fooled = totalVotes - correctVotes;
      const mult = minorityCaught ? OOO_EVASION_MULTIPLIER : 1;
      const delta = POINTS * fooled * mult;
      return { ...p, score: Math.max(0, p.score + delta) };
    }

    // Detective. Streak tracks correct catches regardless of points scored.
    const caught = votes[p.id] === oddOneOutId;
    const streak = caught ? p.streak + 1 : 0;
    const majorityVoted = totalVotes > 0 && received * 2 > totalVotes;

    let delta: number;
    if (majorityVoted) {
      // The table pegged them as the OOO → no points at all this round.
      delta = 0;
    } else {
      const reward = caught
        ? POINTS *
          streakMultiplier(p.streak) *
          (minorityCaught ? MINORITY_MULTIPLIER : 1)
        : 0;
      delta = reward - SUSPICION_PENALTY * received;
    }

    return { ...p, streak, score: Math.max(0, p.score + delta) };
  });

  return {
    ...state,
    phase: "reveal",
    phaseDeadline: null,
    roundsPlayed: state.roundsPlayed + 1,
    round: { ...state.round, scored: true },
    players,
  };
}

/** Move from the reveal screen to the round's scoring leaderboard. */
export function goToScoring(state: GameState): GameState {
  if (state.phase !== "reveal") return state;
  return { ...state, phase: "scoring" };
}

/** Whether the last round has just been played. */
export function isFinalRound(state: GameState): boolean {
  return state.roundsPlayed >= state.totalRounds;
}

/** On the final round, skip the per-round scoreboard: reveal → game over. */
export function finishGame(state: GameState): GameState {
  if (state.phase !== "reveal") return state;
  return { ...state, phase: "gameOver", round: null, phaseDeadline: null };
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
        ? discussionSeconds(state)
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
  return startRound(state, now);
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
  // The real question is hidden from the odd one out only while answering (so
  // they answer blind); from the discussion step on, they see it like everyone
  // else. The OOO prompt stays hidden from everyone else until reveal.
  const hideQuestion = state.phase === "answering" && recipientIsOdd;
  const hidePrompt = !isReveal && !recipientIsOdd;
  const card: QuestionCard = {
    ...state.round.card,
    question: hideQuestion ? "" : state.round.card.question,
    oooPrompt: hidePrompt ? "" : state.round.card.oooPrompt,
  };

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
