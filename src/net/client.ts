import Peer from "peerjs";
import type { DataConnection } from "peerjs";
import type { ClientGameState, PlayerId } from "../game/types";
import { peerIdForCode, type ClientMessage, type HostMessage } from "./protocol";

export type ClientStatus = "connecting" | "connected" | "reconnecting" | "error";

interface ClientCallbacks {
  onState: (state: ClientGameState) => void;
  onStatus: (status: ClientStatus, detail?: string) => void;
}

const RECONNECT_DELAY_MS = 1500;

/**
 * A joining player's connection to the host. Holds no game logic — it sends the
 * player's actions and renders whatever redacted state the host pushes back.
 *
 * A locked/backgrounded phone freezes JS and the WebRTC link dies. We don't try
 * to keep it alive; instead, on wake we re-dial the host and re-send `hello`
 * with the same stable playerId, so the host re-seats us and resends state.
 */
export class ClientSession {
  private peer: Peer;
  private conn: DataConnection | null = null;
  private cb: ClientCallbacks;
  private destroyed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private code: string;
  private playerId: PlayerId;
  private name: string;

  constructor(code: string, playerId: PlayerId, name: string, cb: ClientCallbacks) {
    this.code = code;
    this.playerId = playerId;
    this.name = name;
    this.cb = cb;
    this.peer = new Peer({ debug: 1 });
    this.peer.on("open", () => this.dial());
    this.peer.on("error", (err) => {
      this.cb.onStatus("error", err.type ?? String(err));
      this.scheduleReconnect();
    });
    this.peer.on("disconnected", () => {
      if (!this.destroyed) this.peer.reconnect();
    });

    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private onVisibility = (): void => {
    if (document.visibilityState === "visible" && !this.isConnected()) {
      this.dial();
    }
  };

  private isConnected(): boolean {
    return !!this.conn && this.conn.open;
  }

  private dial(): void {
    if (this.destroyed) return;
    this.cb.onStatus(this.conn ? "reconnecting" : "connecting");

    const conn = this.peer.connect(peerIdForCode(this.code), { reliable: true });
    this.conn = conn;

    conn.on("open", () => {
      this.send({ type: "hello", playerId: this.playerId, name: this.name });
      this.cb.onStatus("connected");
    });
    conn.on("data", (raw) => {
      const msg = raw as HostMessage;
      if (msg.type === "state") this.cb.onState(msg.state);
      else if (msg.type === "error") this.cb.onStatus("error", msg.reason);
    });
    conn.on("close", () => {
      this.cb.onStatus("reconnecting");
      this.scheduleReconnect();
    });
    conn.on("error", () => this.scheduleReconnect());
  }

  private scheduleReconnect(): void {
    if (this.destroyed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isConnected()) this.dial();
    }, RECONNECT_DELAY_MS);
  }

  private send(msg: ClientMessage): void {
    if (this.isConnected()) this.conn!.send(msg);
  }

  submitAnswer(text: string): void {
    this.send({ type: "answer", text });
  }
  submitVote(accusedId: PlayerId): void {
    this.send({ type: "vote", accusedId });
  }

  destroy(): void {
    this.destroyed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.peer.destroy();
  }
}
