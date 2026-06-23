import { useState } from "react";
import type { GameMode } from "../net/useGame";
import { generateCode, getStoredName, setStoredName } from "../net/identity";

interface HomeProps {
  onStart: (s: { mode: GameMode; code: string; name: string }) => void;
}

/** Invite code from the URL (`?code=ABCD`), so a shared link pre-fills join. */
function inviteCode(): string {
  try {
    return (new URLSearchParams(window.location.search).get("code") ?? "")
      .toUpperCase()
      .trim();
  } catch {
    return "";
  }
}

export function Home({ onStart }: HomeProps) {
  const [name, setName] = useState(getStoredName());
  const [code, setCode] = useState(inviteCode);
  const [joining, setJoining] = useState(() => inviteCode().length > 0);

  const trimmedName = name.trim();
  const canCreate = trimmedName.length > 0;
  const canJoin = canCreate && code.trim().length >= 4;

  function create() {
    if (!canCreate) return;
    setStoredName(trimmedName);
    onStart({ mode: "host", code: generateCode(), name: trimmedName });
  }

  function join() {
    if (!canJoin) return;
    setStoredName(trimmedName);
    onStart({ mode: "client", code: code.trim().toUpperCase(), name: trimmedName });
  }

  return (
    <div className="screen home">
      <div className="bg-circles" aria-hidden="true">
        <span className="circle c1"></span>
        <span className="circle c2"></span>
        <span className="circle c3"></span>
      </div>
      <header className="brand">
        <h1>Odd One Out</h1>
        <p className="tagline">
          Everyone answers the same question, except one. Can you spot the odd
          one out?
        </p>
      </header>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        aria-label="Your name"
        maxLength={16}
        autoComplete="off"
      />

      {!joining ? (
        <div className="actions actions-row">
          <button className="ghost" disabled={!canCreate} onClick={create}>
            Host game
          </button>
          <button className="primary" onClick={() => setJoining(true)}>
            Join game
          </button>
        </div>
      ) : (
        <div className="actions">
          <label className="field">
            <span>Game code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={6}
              autoCapitalize="characters"
              autoComplete="off"
              className="code-input"
            />
          </label>
          <div className="actions-row">
            <button className="ghost" onClick={() => setJoining(false)}>
              Back
            </button>
            <button className="primary" disabled={!canJoin} onClick={join}>
              Join game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
