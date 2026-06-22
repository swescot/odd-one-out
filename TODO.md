# TODO

Running backlog for Odd One Out. Loose priority order; move things around freely.

## Next up

- [ ] **Deploy** to a static host (Vercel / Netlify / GitHub Pages). Pure
      static + P2P, so no backend needed — gives a real URL and removes the
      same-Wi-Fi + `npm run dev` requirement.
- [ ] **Imposter Mode** — second game mode (category + secret word, "Designated
      Witness" first speaker, no text input). Design in
      [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md).

## Polish

- [ ] Copy-code-to-clipboard button in the lobby.
- [ ] Expand the question deck (only 10 cards today, in `src/game/questions.ts`).
- [ ] "Play again with the same players" from the game-over screen.
- [ ] Graceful handling if the **host** leaves mid-game.
- [ ] Sound / haptics on key moments (reveal, your turn, timer running out).
- [ ] UI restyling from reference images (buttons, lists, etc.).

## Ideas / maybe

- [ ] Show the real question to the odd one out on the reveal screen (the
      "ahh, that's what it was" moment) — currently hidden from them entirely.
- [ ] Configurable round count / timer durations in the lobby.
- [ ] Per-question syntax tuning so the odd one out blends in better.

## Done

- [x] Core Classic Mode loop (lobby → answer → discuss → vote → reveal → score).
- [x] PeerJS P2P networking, verified flawless on a real multi-device test.
- [x] Reconnect-and-resync after a phone locks/backgrounds.
- [x] Syntax-enforced answers + Jackpot scoring + round timers.
- [x] Hidden dev mode behind `?dev` (simulated players + phase skip).
