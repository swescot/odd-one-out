import { useState } from "react";
import type { ClientGameState, PlayerId } from "../game/types";
import {
  MIN_PLAYERS,
  describeSyntax,
  inputHints,
  validateAnswer,
} from "../game/engine";
import type { GameApi } from "../net/useGame";

function nameOf(state: ClientGameState, id: PlayerId): string {
  return state.players.find((p) => p.id === id)?.name ?? "Someone";
}

interface PhaseProps {
  game: GameApi;
  state: ClientGameState;
}

export function Lobby({ game, state }: PhaseProps) {
  const enough = state.players.length >= MIN_PLAYERS;
  return (
    <div className="screen phase">
      <div className="code-card">
        <span className="label">Game code</span>
        <span className="code">{state.code}</span>
        <span className="hint">Share this so others can join</span>
      </div>

      <h2>
        Players <span className="count">{state.players.length}</span>
      </h2>
      <ul className="players">
        {state.players.map((p) => (
          <li key={p.id} className={p.connected ? "" : "offline"}>
            <span className={`dot ${p.connected ? "on" : "off"}`} />
            {p.name}
            {p.isHost && <span className="tag">host</span>}
            {p.id === game.myId && <span className="tag you">you</span>}
          </li>
        ))}
      </ul>

      {game.isHost ? (
        <>
          <button className="primary" disabled={!enough} onClick={game.startGame}>
            Start game
          </button>
          {!enough && (
            <p className="muted">Need at least {MIN_PLAYERS} players to start.</p>
          )}
          {import.meta.env.DEV && (
            <button className="secondary" onClick={game.addBot}>
              + Add bot (dev)
            </button>
          )}
        </>
      ) : (
        <p className="muted">Waiting for the host to start…</p>
      )}
    </div>
  );
}

export function Answering({ game, state }: PhaseProps) {
  const round = state.round!;
  const iAmOdd = round.oddOneOutId === game.myId;
  const myAnswer = round.answers.find((a) => a.playerId === game.myId);
  const [draft, setDraft] = useState("");

  const answeredCount = round.answers.length;
  const totalConnected = state.players.filter((p) => p.connected).length;

  const syntax = round.card.syntax;
  const hints = inputHints(syntax);
  const error = validateAnswer(syntax, draft);

  return (
    <div className="screen phase">
      <div className="round-tag">Round {round.number}</div>

      {iAmOdd ? (
        <div className="prompt odd">
          <span className="prompt-label">You're the odd one out 🤫</span>
          <p className="prompt-text">{round.card.oooPrompt}</p>
          <span className="hint">
            Everyone else has a real question. Give an answer that fits this and
            try to blend in.
          </span>
        </div>
      ) : (
        <div className="prompt">
          <span className="prompt-label">Question</span>
          <p className="prompt-text">{round.card.question}</p>
        </div>
      )}

      {myAnswer ? (
        <div className="waiting">
          <p>
            Your answer: <strong>{myAnswer.text}</strong>
          </p>
          <p className="muted">
            Waiting for others… {answeredCount}/{totalConnected} answered.
          </p>
        </div>
      ) : (
        <>
          <label className="field">
            <span>Your answer · {describeSyntax(syntax)}</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your answer"
              maxLength={hints.maxLength}
              inputMode={hints.inputMode}
              autoFocus
            />
            {draft.trim() && error && <span className="error">{error}</span>}
          </label>
          <button
            className="primary"
            disabled={!!error}
            onClick={() => game.submitAnswer(draft)}
          >
            Submit answer
          </button>
        </>
      )}

      {game.isHost && (
        <button className="secondary" onClick={game.goToDiscussion}>
          Reveal answers ({answeredCount}/{totalConnected})
        </button>
      )}
    </div>
  );
}

export function Discussion({ game, state }: PhaseProps) {
  const round = state.round!;
  return (
    <div className="screen phase">
      <div className="round-tag">Round {round.number} · Discuss</div>
      <h2>Everyone's answers</h2>
      <p className="muted">
        Take turns motivating your answer out loud. One of these people never saw
        the real question…
      </p>
      <ul className="answers">
        {round.answers.map((a) => (
          <li key={a.playerId}>
            <span className="who">{nameOf(state, a.playerId)}</span>
            <span className="what">{a.text}</span>
          </li>
        ))}
      </ul>
      {game.isHost && (
        <button className="primary" onClick={game.goToVoting}>
          Start voting
        </button>
      )}
    </div>
  );
}

export function Voting({ game, state }: PhaseProps) {
  const round = state.round!;
  const iAmOdd = round.oddOneOutId === game.myId;
  const myVote = round.votes[game.myId];

  if (iAmOdd) {
    return (
      <div className="screen phase">
        <div className="round-tag">Round {round.number} · Voting</div>
        <div className="prompt odd">
          <span className="prompt-label">Lay low 😶</span>
          <p className="prompt-text">
            The others are voting on who the odd one out is. Hope you blended in!
          </p>
        </div>
      </div>
    );
  }

  const candidates = state.players.filter((p) => p.id !== game.myId);

  return (
    <div className="screen phase">
      <div className="round-tag">Round {round.number} · Voting</div>
      <h2>Who's the odd one out?</h2>
      <ul className="vote-list">
        {candidates.map((p) => (
          <li key={p.id}>
            <button
              className={`vote ${myVote === p.id ? "chosen" : ""}`}
              onClick={() => game.submitVote(p.id)}
            >
              {p.name}
              {myVote === p.id && <span className="check">✓</span>}
            </button>
          </li>
        ))}
      </ul>
      {myVote && <p className="muted">Vote locked in. Waiting for others…</p>}
      {game.isHost && (
        <button className="secondary" onClick={game.reveal}>
          Reveal the odd one out
        </button>
      )}
    </div>
  );
}

export function Reveal({ game, state }: PhaseProps) {
  const round = state.round!;
  const oddName = nameOf(state, round.oddOneOutId);
  const last = state.roundsPlayed >= state.totalRounds;

  return (
    <div className="screen phase">
      <div className="round-tag">Round {round.number} · Reveal</div>
      <div className="prompt reveal">
        <span className="prompt-label">The odd one out was</span>
        <p className="prompt-text big">{oddName}</p>
        <span className="hint">Their prompt: “{round.card.oooPrompt}”</span>
        <span className="hint">Real question: “{round.card.question}”</span>
      </div>

      <h2>Votes</h2>
      <ul className="answers">
        {state.players
          .filter((p) => p.id !== round.oddOneOutId)
          .map((p) => {
            const accused = round.votes[p.id];
            const correct = accused === round.oddOneOutId;
            return (
              <li key={p.id}>
                <span className="who">{p.name}</span>
                <span className="what">
                  {accused ? `accused ${nameOf(state, accused)}` : "didn't vote"}{" "}
                  {accused && (correct ? "✅" : "❌")}
                </span>
              </li>
            );
          })}
      </ul>

      <Scores state={state} />

      {game.isHost && (
        <button className="primary" onClick={game.nextRound}>
          {last ? "See final scores" : "Next round"}
        </button>
      )}
    </div>
  );
}

export function GameOver({ game, state, onLeave }: PhaseProps & { onLeave: () => void }) {
  return (
    <div className="screen phase">
      <h1>Final scores</h1>
      <Scores state={state} />
      {game.isHost && (
        <button className="primary" onClick={onLeave}>
          New game
        </button>
      )}
    </div>
  );
}

function Scores({ state }: { state: ClientGameState }) {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  return (
    <ol className="scores">
      {ranked.map((p, i) => (
        <li key={p.id}>
          <span className="rank">{i + 1}</span>
          <span className="who">{p.name}</span>
          <span className="pts">{p.score}</span>
        </li>
      ))}
    </ol>
  );
}
