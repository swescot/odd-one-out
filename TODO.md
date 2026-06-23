# TODO

Running backlog for Odd One Out. Loose priority order; move things around freely.

## Next up

- [ ] **Scoring revamp** — richer scoring with multipliers etc. (design TBD).
      The game is already finite (`DEFAULT_TOTAL_ROUNDS` → `gameOver` end
      screen); revisit round count / end state here and make it configurable.
- [ ] **Imposter Mode** — second game mode (category + secret word, "Designated
      Witness" first speaker, no text input). Design in
      [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md).
- [ ] **UI revamp** — restyle the app from reference images (visual design to
      be provided): buttons, lists, cards, screens.

## Polish

- [ ] Expand the question deck (only 10 cards today, in `src/game/questions.ts`).
- [ ] "Play again with the same players" from the game-over screen.
- [ ] Graceful handling if the **host** leaves mid-game.
- [ ] Sound / haptics on key moments (reveal, your turn, timer running out).
- [ ] **Animations** — transitions and micro-interactions (phase changes,
      button presses, timer, the reveal, score counting up) to make the
      playful theme feel alive.
- [ ] **Player avatars** — a set of animated avatars, randomly assigned to
      players as they join.
- [ ] **Add tracking** — analytics (clarify scope: usage/funnel analytics vs
      error tracking) and pick a tool.
- [ ] **Localisation** — extract UI strings and translate; the question deck
      will need per-language content too.

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
- [x] Deployed to GitHub Pages, auto-deploying on push to `main`:
      https://swescot.github.io/odd-one-out/
- [x] Copy invite link when hosting (`?code=XXXX`), pre-fills the join screen.
