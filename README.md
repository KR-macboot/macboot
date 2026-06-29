# macboot

Boot up a Mac in your browser. 🍎

Click the power button and watch (and hear) a Mac start up: the startup **chime**,
the Apple logo fading in over black, the progress bar filling, and a hand-off to a
macOS-style desktop with a live menu-bar clock and a magnifying Dock.

The startup sound is **synthesized live with the Web Audio API** — there is no audio
file. It's an additive-synthesis reconstruction of the famous tone (a wide F♯/G♭ major
chord tuned ~30 cents flat, with a soft mallet attack and a long, reverberant
ring-out), so no copyrighted recording is shipped.

## Quick start

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
```

Then open the printed local URL and click the power button (or press the spacebar).

## How it works

- **`src/audio/chime.js`** — the chime synthesis engine. Nine voices spanning ~3–4
  octaves (weighted toward the low root + its octave for body, with the third and
  upper octaves adding shimmer), each built from two slightly-detuned `triangle`
  oscillators for chorus. A per-voice gain envelope gives the soft attack and long
  exponential ring-out; a procedurally-generated `ConvolverNode` impulse response
  adds a lush reverb tail; a `DynamicsCompressor` keeps the summed voices from
  clipping. The `AudioContext` is created and resumed from the power-button click so
  the browser autoplay policy lets it sound.
- **`src/components/BootSequence.jsx`** — the black boot screen: the Apple logo fades
  in, then a pill progress bar fills (via `requestAnimationFrame`) and hands off.
- **`src/components/Desktop.jsx`** — the macOS desktop: translucent menu bar with a
  working Apple menu (Restart / Shut Down) and a live clock, plus a magnifying Dock.
- **`src/App.jsx`** — a small `off → booting → desktop` state machine.

## Notes

This is a fan tribute / learning project. Apple, the Apple logo, macOS, and the Mac
startup sound are trademarks of Apple Inc.; this project ships no Apple assets or
recordings — the logo is a path drawing and the chime is synthesized from scratch.

## Tech

[Vite](https://vite.dev) + [React](https://react.dev), Web Audio API, plain CSS.
No runtime dependencies beyond React. Deploys as a static site (e.g. GitHub Pages —
`base` is already set to `./`).
