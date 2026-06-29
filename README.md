# macboot

Boot up a Mac in your browser. 🍎

Click the power button and watch (and hear) a Mac start up: the startup **chime**,
the Apple logo fading in over black, the progress bar filling, and a hand-off to a
macOS-style desktop with a live menu-bar clock and a magnifying Dock.

For the startup sound you have two options:

1. **Drop in a real recording (recommended for fidelity).** Place an audio file at
   `public/chime.mp3` (also accepts `.m4a`, `.wav`, or `.ogg`) and the app plays it.
   This is the most faithful way to get the actual "bong." The file is **git-ignored**,
   so it stays on your machine and is never committed — the repo ships no audio assets.
2. **No file? It falls back to a synthesized approximation** — an additive-synthesis
   reconstruction of the tone (a wide F♯/G♭ major chord ~30 cents flat, soft attack,
   long reverberant ring-out), entirely from oscillators in the browser.

## Quick start

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

Then open the printed local URL and click the power button (or press the spacebar).

To use a real chime, copy your audio file to `public/chime.mp3` before loading the
page (no rebuild needed in dev — just refresh).

## How it works

- **`src/audio/chime.js`** — the sound engine. `playStartupSound()` first tries to
  load a real recording from `public/chime.*`; if none is found it calls the
  synthesizer, `playChime()` — nine voices spanning ~3–4 octaves, each two
  slightly-detuned `triangle` oscillators, with a per-voice soft-attack/long-ring
  gain envelope, a procedural `ConvolverNode` reverb tail, and a `DynamicsCompressor`
  to prevent clipping. The `AudioContext` is created and resumed from the power-button
  click so the browser autoplay policy lets it sound.
- **`src/components/BootSequence.jsx`** — the black boot screen: the Apple logo fades
  in, then a pill progress bar fills (via `requestAnimationFrame`) and hands off.
- **`src/components/Desktop.jsx`** — the macOS desktop: translucent menu bar with a
  working Apple menu (Restart / Shut Down) and a live clock, plus a magnifying Dock.
- **`src/App.jsx`** — a small `off → booting → desktop` state machine.

## Notes

This is a fan tribute / learning project. Apple, the Apple logo, macOS, and the Mac
startup sound are trademarks of Apple Inc.; this project ships no Apple assets or
recordings — the logo is a path drawing and the fallback chime is synthesized from
scratch. Any audio file you place in `public/` is yours and stays local (git-ignored);
sourcing and using it is your responsibility.

## Tech

[Vite](https://vite.dev) + [React](https://react.dev), Web Audio API, plain CSS.
No runtime dependencies beyond React. Deploys as a static site (e.g. GitHub Pages —
`base` is already set to `./`).
