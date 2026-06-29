import { useCallback, useRef, useState } from 'react'
import MacBook from './components/MacBook'
import BootSequence from './components/BootSequence'
import Desktop from './components/Desktop'
import { getAudioContext, playChime } from './audio/chime'
import './App.css'

const PHASE = { OFF: 'off', BOOTING: 'booting', DESKTOP: 'desktop' }

export default function App() {
  const [phase, setPhase] = useState(PHASE.OFF)
  const [muted, setMuted] = useState(false)
  const audioCtxRef = useRef(null)
  const mutedRef = useRef(false)

  // Unlock the AudioContext from the open gesture so the chime — fired a beat
  // later, as the lid swings up — can still sound under the autoplay policy.
  const prepareAudio = useCallback(() => {
    if (!mutedRef.current) getAudioContext(audioCtxRef)
  }, [])

  const chime = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getAudioContext(audioCtxRef)
    if (!ctx) return
    const fire = () => {
      try {
        playChime(ctx)
      } catch {
        /* audio unsupported — keep going visually */
      }
    }
    if (ctx.state === 'suspended') ctx.resume().then(fire).catch(fire)
    else fire()
  }, [])

  const handleOpened = useCallback(() => setPhase(PHASE.BOOTING), [])
  const handleBootComplete = useCallback(() => setPhase(PHASE.DESKTOP), [])
  const handleShutDown = useCallback(() => setPhase(PHASE.OFF), [])
  const handleRestart = useCallback(() => setPhase(PHASE.OFF), [])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      mutedRef.current = !m
      return !m
    })
  }, [])

  return (
    <div className="app">
      {phase === PHASE.OFF && (
        <MacBook
          onPrepareAudio={prepareAudio}
          onChime={chime}
          onOpened={handleOpened}
          muted={muted}
          onToggleMute={toggleMute}
        />
      )}
      {phase === PHASE.BOOTING && <BootSequence onComplete={handleBootComplete} />}
      {phase === PHASE.DESKTOP && (
        <Desktop onRestart={handleRestart} onShutDown={handleShutDown} />
      )}
    </div>
  )
}
