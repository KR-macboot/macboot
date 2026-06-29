// Synthesizes an approximation of the Mac startup chime with the Web Audio API.
//
// No copyrighted recording is used — this is an additive-synthesis reconstruction
// of the trademarked tone: a wide F#/Gb major chord tuned ~30 cents flat (Jim
// Reekes' design), with a soft mallet attack, a long bell-like ring-out, and a
// lush procedural reverb tail.
//
// The chord is voiced across ~3-4 octaves and weighted toward the low root + its
// octave (body), with the major third and upper fifths/octaves adding shimmer.
// The frequencies below are already the ~30-cents-flat values (concert A ≈ 432.4 Hz).

// Each voice: { freq (Hz, already detuned ~30c flat), gain (relative voicing weight) }
const CHIME_VOICES = [
  { freq: 90.9, gain: 0.9 }, //  F#2  root (low octave) — body
  { freq: 136.2, gain: 0.5 }, // C#3  perfect fifth
  { freq: 181.8, gain: 0.8 }, //  F#3  root + 1 octave
  { freq: 229.06, gain: 0.5 }, // A#3  major third
  { freq: 272.39, gain: 0.5 }, // C#4  perfect fifth
  { freq: 363.6, gain: 0.35 }, // F#4  root + 2 octaves
  { freq: 458.11, gain: 0.25 }, // A#4 major third (upper)
  { freq: 544.79, gain: 0.25 }, // C#5 perfect fifth (upper)
  { freq: 727.21, gain: 0.15 }, // F#5 top sparkle
]

// Two oscillators per voice, detuned a few cents apart, create slow beating that
// reads as warmth/chorus rather than as out-of-tune.
const DETUNE_CENTS = [-6, 6]

const ATTACK = 0.045 // soft mallet attack (s) — blooms in, no click
const DECAY = 2.8 // long exponential ring-out (s)
const GAIN_FLOOR = 0.0001 // -80 dB; exponential ramps can't target literal 0
const VOICE_LEVEL = 0.08 // per-oscillator base level (headroom for ~18 oscillators)

let cachedIR = null
let cachedIRRate = 0

// Build a stereo reverb impulse response procedurally: exponentially-decaying
// white noise, decorrelated per channel for a wide tail. Cached per sample rate.
function getReverbIR(ctx, seconds = 2.2, decay = 3) {
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

// Play the chime once on the given (running) AudioContext.
// Returns the approximate total audible duration in seconds.
export function playChime(ctx) {
  const t0 = ctx.currentTime + 0.03 // tiny lookahead so nothing is scheduled in the past

  // Master bus with a soft overall envelope (soft in, hold, long exponential tail).
  const master = ctx.createGain()
  master.gain.setValueAtTime(GAIN_FLOOR, t0)
  master.gain.linearRampToValueAtTime(1.0, t0 + 0.03)
  master.gain.setValueAtTime(1.0, t0 + 1.8) // anchor before the final fade
  master.gain.exponentialRampToValueAtTime(GAIN_FLOOR, t0 + 4.0)

  // Gentle low-pass rolls off the harsh upper partials → warmth.
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 5200
  tone.Q.value = 0.5

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
  wet.gain.value = 0.5
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
    const start = t0 + idx * 0.008
    const peak = voice.gain * VOICE_LEVEL

    // Click-free bell envelope: seed → linear attack → long exponential ring-out.
    const env = ctx.createGain()
    env.gain.setValueAtTime(GAIN_FLOOR, start)
    env.gain.linearRampToValueAtTime(peak, start + ATTACK)
    env.gain.exponentialRampToValueAtTime(GAIN_FLOOR, start + ATTACK + DECAY)
    env.connect(master)

    DETUNE_CENTS.forEach((cents) => {
      const osc = ctx.createOscillator()
      osc.type = 'triangle' // warm, bell-ish; richer than a pure sine
      osc.frequency.value = voice.freq
      osc.detune.value = cents
      osc.connect(env)
      osc.start(start)
      osc.stop(start + ATTACK + DECAY + 0.2) // free the node once it's silent
    })
  })

  return 4.0
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
