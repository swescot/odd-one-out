import Peer from "peerjs";
import type { DataConnection } from "peerjs";
import type {
  ClientGameState,
  GameState,
  Phase,
  PlayerId,
  SyntaxType,
} from "../game/types";
import * as engine from "../game/engine";
import { DEV_MODE } from "../devMode";
import { peerIdForCode, type ClientMessage } from "./protocol";

/** Dev step-back targets: where the left arrow takes you from each phase. */
const PREV_PHASE: Partial<Record<Phase, Phase>> = {
  discussion: "answering",
  voting: "discussion",
  reveal: "voting",
  scoring: "reveal",
  gameOver: "scoring",
};

export type HostStatus = "starting" | "ready" | "error";

interface HostCallbacks {
  /** Called with the host player's own redacted view whenever state changes. */
  onState: (view: ClientGameState) => void;
  onStatus: (status: HostStatus, detail?: string) => void;
}

/**
 * Runs the authoritative game on the creator's device. The host is also a
 * player. Remote players connect over PeerJS; the host never routes game logic
 * through a server — only PeerJS's signaling broker introduces the peers.
 */
export class HostSession {
  readonly code: string;
  private peer: Peer | null = null;
  private state: GameState;
  /** playerId -> their live data connection. */
  private conns = new Map<PlayerId, DataConnection>();
  private cb: HostCallbacks;
  private destroyed = false;
  /** Fires when the current timed phase should auto-advance. */
  private advanceTimer: ReturnType<typeof setTimeout> | null = null;
  /** Dev-only simulated players (no real connection); auto-play each phase. */
  private botIds = new Set<PlayerId>();

  constructor(code: string, hostId: PlayerId, hostName: string, cb: HostCallbacks) {
    this.code = code;
    this.cb = cb;
    this.state = engine.addOrReconnectPlayer(
      engine.createGame(code),
      hostId,
      hostName,
      true,
    );
  }

  get hostId(): PlayerId {
    return this.state.players[0].id;
  }

  start(): void {
    const peer = new Peer(peerIdForCode(this.code), { debug: 1 });
    this.peer = peer;

    peer.on("open", () => this.cb.onStatus("ready"));
    peer.on("error", (err) => {
      this.cb.onStatus("error", err.type ?? String(err));
    });
    peer.on("connection", (conn) => this.handleConnection(conn));
    // If the broker connection drops, regain it so new players can still join.
    peer.on("disconnected", () => {
      if (!this.destroyed) peer.reconnect();
    });

    this.emit();
  }

  private handleConnection(conn: DataConnection): void {
    conn.on("data", (raw) => this.handleMessage(conn, raw as ClientMessage));
    conn.on("close", () => this.handleClose(conn));
    conn.on("error", () => this.handleClose(conn));
  }

  private handleMessage(conn: DataConnection, msg: ClientMessage): void {
    switch (msg.type) {
      case "hello": {
        // New or returning player. Bind their id to this connection and resync.
        this.conns.set(msg.playerId, conn);
        this.mutate((s) => engine.addOrReconnectPlayer(s, msg.playerId, msg.name));
        break;
      }
      case "answer": {
        const playerId = this.playerIdFor(conn);
        if (playerId) {
          this.mutate((s) => engine.submitAnswer(s, playerId, msg.text));
        }
        break;
      }
      case "vote": {
        const playerId = this.playerIdFor(conn);
        if (playerId) {
          this.mutate((s) => engine.submitVote(s, playerId, msg.accusedId));
        }
        break;
      }
    }
  }

  private handleClose(conn: DataConnection): void {
    const playerId = this.playerIdFor(conn);
    if (playerId) {
      this.conns.delete(playerId);
      this.mutate((s) => engine.setConnected(s, playerId, false));
    }
  }

  private playerIdFor(conn: DataConnection): PlayerId | undefined {
    for (const [id, c] of this.conns) if (c === conn) return id;
    return undefined;
  }

  /** Apply a pure engine transition, then push fresh views to everyone. */
  private mutate(fn: (s: GameState) => GameState): void {
    this.state = fn(this.state);
    this.applyBots();
    this.autoAdvance();
    this.emit();
    this.scheduleAdvance();
  }

  /** Progress phases that should advance on their own (not on a host click). */
  private autoAdvance(): void {
    // In dev mode the host drives every transition manually (skip / arrows).
    if (DEV_MODE) return;
    // Answering ends as soon as everyone connected has submitted an answer.
    if (this.state.phase === "answering" && engine.allAnswered(this.state)) {
      this.state = engine.goToDiscussion(this.state, Date.now());
    }
  }

  /**
   * Dev-only: let any bot that hasn't acted yet take its turn. Runs against the
   * pure engine (not the public methods) so it can't re-enter mutate(); the
   * caller emits once afterwards.
   */
  private applyBots(): void {
    if (this.botIds.size === 0 || !this.state.round) return;
    let s = this.state;
    if (s.phase === "answering") {
      for (const id of this.botIds) {
        if (!s.round!.answers.some((a) => a.playerId === id)) {
          s = engine.submitAnswer(s, id, botAnswer(s.round!.card.syntax));
        }
      }
    } else if (s.phase === "voting") {
      for (const id of this.botIds) {
        if (id === s.round!.oddOneOutId || id in s.round!.votes) continue;
        const others = s.players.filter((p) => p.id !== id);
        const target = others[Math.floor(Math.random() * others.length)];
        s = engine.submitVote(s, id, target.id);
      }
    }
    this.state = s;
  }

  /** (Re)arm the auto-advance timer for the current timed phase, if any. */
  private scheduleAdvance(): void {
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
    // In dev mode the timer still counts down but never advances on its own.
    if (DEV_MODE) return;
    const dl = this.state.phaseDeadline;
    if (dl == null) return;
    const phase = this.state.phase;
    this.advanceTimer = setTimeout(
      () => {
        this.advanceTimer = null;
        // Phase guards make these no-ops if the host already advanced manually.
        if (phase === "answering") this.goToDiscussion();
        else if (phase === "discussion") this.goToVoting();
        else if (phase === "voting") this.reveal();
      },
      Math.max(0, dl - Date.now()),
    );
  }

  private emit(): void {
    // Each remote player gets a view redacted for them.
    for (const [playerId, conn] of this.conns) {
      if (conn.open) {
        conn.send({ type: "state", state: engine.viewFor(this.state, playerId) });
      }
    }
    // The host renders its own view locally.
    this.cb.onState(engine.viewFor(this.state, this.hostId));
  }

  // --- Host-only controls (driven by the host's UI buttons) ---

  startGame(): void {
    this.mutate((s) => engine.startGame(s, Date.now()));
  }
  goToDiscussion(): void {
    this.mutate((s) => engine.goToDiscussion(s, Date.now()));
  }
  goToVoting(): void {
    this.mutate((s) => engine.goToVoting(s, Date.now()));
  }
  reveal(): void {
    this.mutate(engine.revealAndScore);
  }
  goToScoring(): void {
    this.mutate(engine.goToScoring);
  }
  finishGame(): void {
    this.mutate(engine.finishGame);
  }
  nextRound(): void {
    this.mutate((s) => engine.nextRound(s, Date.now()));
  }
  returnToLobby(): void {
    this.mutate(engine.returnToLobby);
  }

  // The host is also a player and can answer/vote on its own device.
  submitAnswer(text: string): void {
    this.mutate((s) => engine.submitAnswer(s, this.hostId, text));
  }
  submitVote(accusedId: PlayerId): void {
    this.mutate((s) => engine.submitVote(s, this.hostId, accusedId));
  }

  // --- Dev-only helpers (UI gated behind import.meta.env.DEV) ---

  /** Add a simulated player that auto-answers and auto-votes. */
  addBot(): void {
    const taken = new Set(this.state.players.map((p) => p.name));
    const name = BOT_NAMES.find((n) => !taken.has(n)) ?? `Bot ${this.botIds.size + 1}`;
    const id = `bot_${this.botIds.size}_${name}`;
    this.botIds.add(id);
    this.mutate((s) => engine.addOrReconnectPlayer(s, id, name));
  }

  /** Jump straight to the next phase, bypassing the timer. */
  skipPhase(): void {
    switch (this.state.phase) {
      case "answering":
        this.goToDiscussion();
        break;
      case "discussion":
        this.goToVoting();
        break;
      case "voting":
        this.reveal();
        break;
      case "reveal":
        if (engine.isFinalRound(this.state)) this.finishGame();
        else this.goToScoring();
        break;
      case "scoring":
        this.nextRound();
        break;
    }
  }

  /** Step back to the previous phase (no score/round changes). */
  stepBack(): void {
    const prev = PREV_PHASE[this.state.phase];
    if (prev) this.mutate((s) => engine.devGoToPhase(s, prev, Date.now()));
  }

  destroy(): void {
    this.destroyed = true;
    if (this.advanceTimer) clearTimeout(this.advanceTimer);
    this.peer?.destroy();
    this.conns.clear();
  }
}

const BOT_NAMES = ["Bea", "Cy", "Di", "Ed", "Fi", "Gus", "Hal", "Ivy", "Jo"];
const BOT_WORDS = ["otter", "ladder", "mango", "cactus", "banjo", "pickle"];
const BOT_PHRASES = ["a banana", "loud socks", "wet cardboard", "jazz", "a spare tyre"];

function botAnswer(s: SyntaxType): string {
  switch (s.kind) {
    case "integer":
      return String(s.min + Math.floor(Math.random() * (s.max - s.min + 1)));
    case "word":
      return BOT_WORDS[Math.floor(Math.random() * BOT_WORDS.length)];
    case "phrase":
      return BOT_PHRASES[Math.floor(Math.random() * BOT_PHRASES.length)];
  }
}
