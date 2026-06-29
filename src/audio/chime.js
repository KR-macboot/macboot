// Synthesizes an approximation of the Mac startup chime with the Web Audio API.
//
// No recording is used. Each chord note is an FM "bell" voice (a sine carrier
// frequency-modulated by a second sine at a slightly inharmonic ratio), which
// gives the struck, metallic-but-warm bell timbre that plain oscillators can't.
// The notes form a wide F#/Gb major chord tuned ~30 cents flat (Jim Reekes'
// design), with a soft attack, a long ring-out, and a lush procedural reverb.
//
// The tunable block below is meant to be tweaked by ear — adjust and reload.

// Each voice: { freq (Hz, already ~30c flat), gain (relative voicing weight) }.
const CHIME_VOICES = [
  { freq: 90.9, gain: 0.9 }, //  F#2  root (low octave) — body
  { freq: 136.2, gain: 0.5 }, // C#3  perfect fifth
  { freq: 181.8, gain: 0.85 }, // F#3 root + 1 octave
  { freq: 229.06, gain: 0.5 }, // A#3 major third
  { freq: 272.39, gain: 0.5 }, // C#4 perfect fifth
  { freq: 363.6, gain: 0.4 }, //  F#4 root + 2 octaves
  { freq: 458.11, gain: 0.28 }, // A#4 major third (upper)
  { freq: 544.79, gain: 0.26 }, // C#5 perfect fifth (upper)
  { freq: 727.21, gain: 0.18 }, // F#5 top sparkle
]

// ---- Tunable FM-bell parameters (adjust by ear) ----
const ATTACK = 0.012 // soft mallet attack (s)
const DECAY = 3.2 // long exponential ring-out (s)
const MOD_RATIO = 1.5 // modulator:carrier ratio — slightly inharmonic = bell-like
const MOD_DEPTH_START = 0.9 // initial FM depth as a fraction of carrier freq (bright attack)
const MOD_DEPTH_END = 0.06 // FM depth at the tail (mellow ring-out)
const MOD_DECAY = 1.4 // how fast the brightness fades (s)
const SPARKLE = 0.25 // gain of an octave-up sine partial added for shimmer
const MASTER_LEVEL = 0.17 // overall per-voice level (headroom; limiter catches peaks)

const GAIN_FLOOR = 0.0001 // -80 dB; exponential ramps can't target literal 0

let cachedIR = null
let cachedIRRate = 0

// Build a stereo reverb impulse response procedurally: exponentially-decaying
// white noise, decorrelated per channel for a wide tail. Cached per sample rate.
function getReverbIR(ctx, seconds = 2.4, decay = 2.6) {
  if (cachedIR && cachedIRRate === ctx.sampleRate) return cachedIR
  const rate = ctx.sampleRate
  const length = Math.max(1, Math.floor(rate * seconds))
  const ir = ctx.createBuffer(2, length, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  cachedIR = ir
  cachedIRRate = rate
  return ir
}

// One FM-bell voice: carrier (sine) FM'd by a modulator (sine), shaped by a
// soft-attack / long-decay amplitude envelope, plus a quiet octave sparkle.
function spawnVoice(ctx, dest, freq, weight, start) {
  const peak = weight * MASTER_LEVEL

  // Amplitude envelope.
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(GAIN_FLOOR, start)
  amp.gain.linearRampToValueAtTime(peak, start + ATTACK)
  amp.gain.exponentialRampToValueAtTime(GAIN_FLOOR, start + DECAY)
  amp.connect(dest)

  // Carrier.
  const carrier = ctx.createOscillator()
  carrier.type = 'sine'
  carrier.frequency.value = freq
  carrier.connect(amp)

  // Modulator → modGain (FM depth, in Hz) → carrier.frequency.
  const mod = ctx.createOscillator()
  mod.type = 'sine'
  mod.frequency.value = freq * MOD_RATIO
  const modGain = ctx.createGain()
  modGain.gain.setValueAtTime(freq * MOD_DEPTH_START, start)
  modGain.gain.exponentialRampToValueAtTime(freq * MOD_DEPTH_END, start + MOD_DECAY)
  mod.connect(modGain)
  modGain.connect(carrier.frequency)

  // Quiet octave-up sine for shimmer.
  const sparkle = ctx.createOscillator()
  sparkle.type = 'sine'
  sparkle.frequency.value = freq * 2
  const sparkleGain = ctx.createGain()
  sparkleGain.gain.value = SPARKLE
  sparkle.connect(sparkleGain)
  sparkleGain.connect(amp)

  const stop = start + DECAY + 0.15
  carrier.start(start)
  mod.start(start)
  sparkle.start(start)
  carrier.stop(stop)
  mod.stop(stop)
  sparkle.stop(stop)
}

// Play the chime once on the given (running) AudioContext.
// Returns the approximate total audible duration in seconds.
export function playChime(ctx) {
  const t0 = ctx.currentTime + 0.03 // tiny lookahead so nothing is scheduled in the past

  // Master bus with a soft overall envelope.
  const master = ctx.createGain()
  master.gain.setValueAtTime(GAIN_FLOOR, t0)
  master.gain.linearRampToValueAtTime(1.0, t0 + 0.03)
  master.gain.setValueAtTime(1.0, t0 + 2.0)
  master.gain.exponentialRampToValueAtTime(GAIN_FLOOR, t0 + 4.2)

  // Gentle low-pass keeps the FM brightness from getting harsh.
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 6500
  tone.Q.value = 0.4

  // Brick-wall-ish safety limiter so summed voices + reverb never clip.
  const limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = -3
  limiter.knee.value = 0
  limiter.ratio.value = 20
  limiter.attack.value = 0.003
  limiter.release.value = 0.25

  // Parallel wet/dry reverb send keeps the attack crisp while adding a tail.
  const convolver = ctx.createConvolver()
  convolver.buffer = getReverbIR(ctx)
  const wet = ctx.createGain()
  wet.gain.value = 0.6
  const dry = ctx.createGain()
  dry.gain.value = 0.8

  master.connect(tone)
  tone.connect(dry)
  dry.connect(limiter)
  tone.connect(convolver)
  convolver.connect(wet)
  wet.connect(limiter)
  limiter.connect(ctx.destination)

  CHIME_VOICES.forEach((voice, idx) => {
    // Stagger note onsets a touch so the chord blooms instead of thudding.
    spawnVoice(ctx, master, voice.freq, voice.gain, t0 + idx * 0.007)
  })

  return 4.2
}

// Lazily create (once) and resume an AudioContext. MUST be called from inside a
// user-gesture handler the first time, or the browser autoplay policy keeps it
// suspended and no sound is produced.
export function getAudioContext(ref) {
  if (!ref.current) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    ref.current = new Ctx()
  }
  const ctx = ref.current
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}
