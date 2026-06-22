import { useState } from "react";
import type { GameMode } from "./net/useGame";
import { Home } from "./screens/Home";
import { GameScreen } from "./screens/GameScreen";
import "./App.css";

interface Session {
  mode: GameMode;
  code: string;
  name: string;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <div className="app">
      {session ? (
        <GameScreen
          mode={session.mode}
          code={session.code}
          name={session.name}
          onLeave={() => setSession(null)}
        />
      ) : (
        <Home onStart={setSession} />
      )}
    </div>
  );
}
