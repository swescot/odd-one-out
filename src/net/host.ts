import Peer from "peerjs";
import type { DataConnection } from "peerjs";
import type { ClientGameState, GameState, PlayerId } from "../game/types";
import * as engine from "../game/engine";
import { peerIdForCode, type ClientMessage } from "./protocol";

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
    this.emit();
    this.scheduleAdvance();
  }

  /** (Re)arm the auto-advance timer for the current timed phase, if any. */
  private scheduleAdvance(): void {
    if (this.advanceTimer) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
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
  nextRound(): void {
    this.mutate((s) => engine.nextRound(s, Date.now()));
  }

  // The host is also a player and can answer/vote on its own device.
  submitAnswer(text: string): void {
    this.mutate((s) => engine.submitAnswer(s, this.hostId, text));
  }
  submitVote(accusedId: PlayerId): void {
    this.mutate((s) => engine.submitVote(s, this.hostId, accusedId));
  }

  destroy(): void {
    this.destroyed = true;
    if (this.advanceTimer) clearTimeout(this.advanceTimer);
    this.peer?.destroy();
    this.conns.clear();
  }
}
