# Odd One Out

A multiplayer social-deduction party game for phones. Everyone answers the same
question — except one player, the **Odd One Out**, who never sees the question
and only gets a vague prompt about what a suitable answer might look like.
Everyone then defends their answer out loud, and the group votes on who the
imposter is.

> _Question:_ "What would make a surprisingly good milkshake flavour?"
> _The odd one out only sees:_ "Name a food item."

## How it works

There is **no game server**. One player hosts the game on their own device and
gets a short code; everyone else joins with that code. The host's device holds
the single authoritative game state and everyone else is a thin client.

Connectivity is peer-to-peer over WebRTC via [PeerJS](https://peerjs.com/). The
only shared infrastructure is PeerJS's free signaling broker, which just
introduces peers to each other — no game data flows through it.

- **Host-authoritative state** — all game logic runs on the host; clients send
  actions and render whatever (redacted) state the host pushes back.
- **Secrets stay secret** — the engine redacts state per-recipient before
  sending, so the real question never reaches the odd one out's device and the
  odd-one-out prompt never reaches anyone else's.
- **Reconnect-and-resync** — a phone that locks or backgrounds drops its WebRTC
  link; on wake it re-dials the host with a stable identity and is re-seated
  with no lost state. The host holds a screen wake lock so the game doesn't
  stall if the host's screen sleeps.

See [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) for the full game design,
including the planned Imposter mode, and [TODO.md](TODO.md) for the backlog.

## Tech stack

Vite + React + TypeScript, PeerJS for networking. No backend.

## Play

The app is live at **https://swescot.github.io/odd-one-out/** — open it on any
device, host a game, and share the code (or eventually a link). Because it's
peer-to-peer over the internet, players do **not** need to be on the same
network.

You need at least **3 players** to start a round.

## Local development

```bash
npm install
npm run dev
```

Open the printed `Local` URL. To test across devices on your LAN without
deploying, open the printed `Network` URL on each phone (the dev server runs
with `server.host: true`).

Pushing to `main` builds and publishes to GitHub Pages automatically (see
[.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

## Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the dev server (exposed on the LAN)    |
| `npm run build`   | Type-check and build for production          |
| `npm run preview` | Preview the production build locally         |
| `npm run lint`    | Run ESLint                                   |

## Developer mode

A hidden developer mode adds tools for testing the multiplayer game on a single
device. As the **host**, it lets you add simulated bot players (which auto-answer
and auto-vote) and step through phases manually — a "Skip" button or the **←/→
arrow keys** to move back and forth. In dev mode phases never auto-advance (the
timer keeps counting but won't move on by itself).

It is off by default and toggled with a URL flag, so it works on any build
(including a deployed one) without being noticeable to players:

- `?dev` — turn it on (remembered in `localStorage`, so type it once)
- `?dev=off` — turn it off again

## Project layout

```
src/
  game/        Pure, host-authoritative game logic
    types.ts       Domain model (Player, Round, phases, syntax types)
    questions.ts   The question deck
    engine.ts      State transitions, scoring, per-recipient redaction
  net/         Networking layer (PeerJS), swappable behind a clean API
    host.ts        HostSession — authoritative state, accepts peers, broadcasts
    client.ts      ClientSession — connects by code, reconnects on wake
    protocol.ts    Wire messages + join-code namespacing
    identity.ts    Stable per-device player id
    wakeLock.ts    Keeps the host's screen awake
    useGame.ts     React hook unifying host and client for the UI
  screens/     UI: Home, GameScreen (phase router), and the per-phase screens
docs/
  GAME_DESIGN.md   Game modes, rules, scoring, and content guidelines
```
