import { useEffect, useState } from "react";
import { useGame, type GameMode } from "../net/useGame";
import { DEV_MODE } from "../devMode";
import {
  Answering,
  Discussion,
  GameOver,
  Lobby,
  Reveal,
  Voting,
} from "./phases";

interface GameScreenProps {
  mode: GameMode;
  code: string;
  name: string;
  onLeave: () => void;
}

const STATUS_TEXT: Record<string, string> = {
  starting: "Starting game…",
  connecting: "Connecting…",
  reconnecting: "Reconnecting…",
  error: "Connection problem",
};

export function GameScreen({ mode, code, name, onLeave }: GameScreenProps) {
  const game = useGame(mode, code, name);
  const { state, status, statusDetail } = game;

  const showBanner = status !== "ready" && status !== "connected";

  return (
    <div className="game">
      <div className="topbar">
        <button className="leave" onClick={onLeave}>
          ← Leave
        </button>
        <div className="topbar-right">
          {DEV_MODE &&
            game.isHost &&
            state &&
            state.phase !== "lobby" &&
            state.phase !== "gameOver" && (
              <button className="skip" onClick={game.skipPhase}>
                Skip ▸
              </button>
            )}
          <PhaseTimer deadline={state?.phaseDeadline ?? null} />
          <span className="topbar-code">{code}</span>
          {game.isHost && <span className="tag">hosting</span>}
        </div>
      </div>

      {showBanner && (
        <div className={`banner ${status === "error" ? "err" : ""}`}>
          {STATUS_TEXT[status] ?? status}
          {status === "error" && statusDetail ? ` (${statusDetail})` : ""}
        </div>
      )}

      {!state ? (
        <div className="screen phase">
          <p className="muted">
            {mode === "host" ? "Setting up your game…" : "Joining game…"}
          </p>
        </div>
      ) : (
        renderPhase(game.state!.phase, game, onLeave)
      )}
    </div>
  );
}

/** Live mm:ss countdown to the phase deadline, driven by the local clock. */
function PhaseTimer({ deadline }: { deadline: number | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (deadline == null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [deadline]);

  if (deadline == null) return null;
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  return (
    <span className={`timer ${remaining <= 10 ? "low" : ""}`}>
      {mm}:{String(ss).padStart(2, "0")}
    </span>
  );
}

function renderPhase(
  phase: string,
  game: ReturnType<typeof useGame>,
  onLeave: () => void,
) {
  const state = game.state!;
  switch (phase) {
    case "lobby":
      return <Lobby game={game} state={state} />;
    case "answering":
      return <Answering game={game} state={state} />;
    case "discussion":
      return <Discussion game={game} state={state} />;
    case "voting":
      return <Voting game={game} state={state} />;
    case "reveal":
      return <Reveal game={game} state={state} />;
    case "gameOver":
      return <GameOver game={game} state={state} onLeave={onLeave} />;
    default:
      return null;
  }
}
