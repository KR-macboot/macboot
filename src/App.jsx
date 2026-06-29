import { useCallback, useRef, useState } from 'react'
import OffScreen from './components/OffScreen'
import BootSequence from './components/BootSequence'
import Desktop from './components/Desktop'
import { getAudioContext, playChime } from './audio/chime'
import './App.css'

const PHASE = { OFF: 'off', BOOTING: 'booting', DESKTOP: 'desktop' }
const RESTART_GAP_MS = 800 // black screen pause between Restart and the next boot

export default function App() {
  const [phase, setPhase] = useState(PHASE.OFF)
  const [muted, setMuted] = useState(false)
  const audioCtxRef = useRef(null)
  const mutedRef = useRef(false)

  // Start the boot: play the chime (unless muted) and switch to the boot screen.
  // Must run from a user gesture the first time so the audio context unlocks; on
  // Restart the context is already running, so the chime replays without a gesture.
  const boot = useCallback(() => {
    if (!mutedRef.current) {
      const ctx = getAudioContext(audioCtxRef)
      if (ctx) {
        const fire = () => {
          try {
            playChime(ctx)
          } catch {
            /* audio unsupported — boot visually anyway */
          }
        }
        // Resume may still be pending on the very first gesture; fire once ready.
        if (ctx.state === 'suspended') ctx.resume().then(fire).catch(fire)
        else fire()
      }
    }
    setPhase(PHASE.BOOTING)
  }, [])

  // OffScreen only renders while phase is OFF, so a power-on can only mean "boot".
  const handleBootComplete = useCallback(() => setPhase(PHASE.DESKTOP), [])

  const handleShutDown = useCallback(() => setPhase(PHASE.OFF), [])

  const handleRestart = useCallback(() => {
    setPhase(PHASE.OFF)
    window.setTimeout(boot, RESTART_GAP_MS)
  }, [boot])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      mutedRef.current = !m
      return !m
    })
  }, [])

  return (
    <div className="app">
      {phase === PHASE.OFF && (
        <OffScreen onPowerOn={boot} muted={muted} onToggleMute={toggleMute} />
      )}
      {phase === PHASE.BOOTING && <BootSequence onComplete={handleBootComplete} />}
      {phase === PHASE.DESKTOP && (
        <Desktop onRestart={handleRestart} onShutDown={handleShutDown} />
      )}
    </div>
  )
}
