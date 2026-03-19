# Games

A collection of browser-based games — no installs, no dependencies. Open any file in a browser and play.

---

## Games

### Top-Down Shooter
`shooter/index.html`

A retro pixel-art top-down shooter built with HTML5 Canvas and the Web Audio API.

- Move with **Arrow keys** or **WASD**, aim with the **mouse**, shoot with **left click**
- 4 enemy types with distinct behaviors: Grunt, Runner, Brute, Shooter
- 4 handcrafted levels + procedurally scaled difficulty beyond level 4
- Wave-based progression with inter-wave breaks
- Synthesized sound effects and chiptune menu music (no audio files)
- High score saved to `localStorage`

---

### Tic Tac Toe
`tictactoe.html`

Classic two-player Tic Tac Toe in a single HTML file.

- Two-player local game
- Win detection with visual highlight
- Restart button

---

## Running Locally

Just open the HTML file directly in any modern browser — no server needed.

```
shooter/index.html    →  open in browser
tictactoe.html        →  open in browser
```

---

## Tech

All games are self-contained with zero external dependencies:

- **Rendering** — HTML5 Canvas 2D API
- **Audio** — Web Audio API (procedurally generated)
- **Storage** — `localStorage` for persistent scores
- **Languages** — Vanilla HTML, CSS, JavaScript
