# macboot

Boot up a Mac in your browser. 🍎

Power on and watch (and hear) a Mac start up: the startup **chime**, the Apple logo
fading in over black, the progress bar filling, and a hand-off to a macOS-style
desktop with a live menu-bar clock and a magnifying Dock.

**Turn it on** the way you'd open a real MacBook: a closed 3D MacBook sits there,
and you **drag/click/scroll up** to lift the lid (or tilt a phone) — the screen
powers on, the chime plays, and it boots.

The startup sound is **synthesized live with the Web Audio API** — no audio file.
Each chord note is an FM "bell" voice (a sine carrier frequency-modulated by a second
sine at a slightly inharmonic ratio), forming a wide F♯/G♭ major chord tuned ~30 cents
flat, with a soft attack, a long ring-out, and a procedural reverb tail.

## Quick start

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

Then open the printed local URL and power on.

## How it works

- **`src/audio/chime.js`** — the FM-bell synth. `playChime()` builds each of nine
  voices (a wide F♯/G♭ major chord across ~3–4 octaves) from a sine carrier modulated
  by a second sine, with a decaying modulation index for a bright-then-mellow bell, a
  soft-attack/long-ring amplitude envelope, a procedural `ConvolverNode` reverb, and a
  `DynamicsCompressor` to prevent clipping. The tunable block up top is meant to be
  adjusted by ear. The `AudioContext` is unlocked from the power-on gesture.
- **`src/components/MacBook.jsx`** — the closed 3D MacBook (CSS 3D transforms). Drag,
  click, scroll, or tilt to swing the lid open; the screen powers on and the chime
  fires mid-swing, then it hands off to the boot sequence.
- **`src/components/BootSequence.jsx`** — the black boot screen: the Apple logo fades
  in, then a pill progress bar fills (via `requestAnimationFrame`) and hands off.
- **`src/components/Desktop.jsx`** / **`DockIcons.jsx`** — the macOS desktop: an
  abstract wallpaper, a frosted menu bar with SVG status icons + a working Apple menu
  (Restart / Shut Down) and live clock, and a magnifying Dock of SVG app icons.
- **`src/App.jsx`** — a small `off → booting → desktop` state machine.

## Notes

This is a fan tribute / learning project. Apple, the Apple logo, macOS, and the Mac
startup sound are trademarks of Apple Inc.; this project ships no Apple assets or
recordings — the logo and app icons are drawings and the chime is synthesized from
scratch.

## Tech

[Vite](https://vite.dev) + [React](https://react.dev), Web Audio API, plain CSS.
No runtime dependencies beyond React. Deploys as a static site (e.g. GitHub Pages —
`base` is already set to `./`).
