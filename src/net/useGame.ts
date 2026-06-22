import { useEffect, useRef, useState } from "react";
import type { ClientGameState, PlayerId } from "../game/types";
import { getPlayerId } from "./identity";
import { HostSession, type HostStatus } from "./host";
import { ClientSession, type ClientStatus } from "./client";
import {
  acquireWakeLock,
  installWakeLockReacquire,
  releaseWakeLock,
} from "./wakeLock";

export type GameMode = "host" | "client";
export type ConnStatus = HostStatus | ClientStatus;

export interface GameApi {
  mode: GameMode;
  myId: PlayerId;
  status: ConnStatus;
  statusDetail?: string;
  state: ClientGameState | null;
  isHost: boolean;
  // Host-only controls (no-ops on a client).
  startGame: () => void;
  goToDiscussion: () => void;
  goToVoting: () => void;
  reveal: () => void;
  nextRound: () => void;
  // Available to every player.
  submitAnswer: (text: string) => void;
  submitVote: (accusedId: PlayerId) => void;
  // Dev-only (no-ops on a client); UI is gated behind import.meta.env.DEV.
  addBot: () => void;
  skipPhase: () => void;
}

/**
 * Spins up a HostSession or ClientSession and exposes one uniform API to the
 * UI, so screens don't care which side of the connection they're on.
 */
export function useGame(
  mode: GameMode,
  code: string,
  name: string,
): GameApi {
  const myId = getPlayerId();
  const [state, setState] = useState<ClientGameState | null>(null);
  const [status, setStatus] = useState<ConnStatus>(
    mode === "host" ? "starting" : "connecting",
  );
  const [statusDetail, setStatusDetail] = useState<string | undefined>();

  const hostRef = useRef<HostSession | null>(null);
  const clientRef = useRef<ClientSession | null>(null);

  useEffect(() => {
    if (mode === "host") {
      const host = new HostSession(code, myId, name, {
        onState: setState,
        onStatus: (s, d) => {
          setStatus(s);
          setStatusDetail(d);
        },
      });
      hostRef.current = host;
      host.start();
      installWakeLockReacquire();
      void acquireWakeLock();
      return () => {
        releaseWakeLock();
        host.destroy();
        hostRef.current = null;
      };
    }

    const client = new ClientSession(code, myId, name, {
      onState: setState,
      onStatus: (s, d) => {
        setStatus(s);
        setStatusDetail(d);
      },
    });
    clientRef.current = client;
    return () => {
      client.destroy();
      clientRef.current = null;
    };
    // Sessions are keyed by mode+code+name for the life of the game screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, code, name]);

  const host = () => hostRef.current;
  const client = () => clientRef.current;

  return {
    mode,
    myId,
    status,
    statusDetail,
    state,
    isHost: mode === "host",
    startGame: () => host()?.startGame(),
    goToDiscussion: () => host()?.goToDiscussion(),
    goToVoting: () => host()?.goToVoting(),
    reveal: () => host()?.reveal(),
    nextRound: () => host()?.nextRound(),
    submitAnswer: (text) =>
      mode === "host" ? host()?.submitAnswer(text) : client()?.submitAnswer(text),
    submitVote: (accusedId) =>
      mode === "host"
        ? host()?.submitVote(accusedId)
        : client()?.submitVote(accusedId),
    addBot: () => host()?.addBot(),
    skipPhase: () => host()?.skipPhase(),
  };
}
