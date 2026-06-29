import { useCallback, useEffect, useRef, useState } from 'react'
import './OffScreen.css'

// Degrees of front-back tilt (from the armed baseline) that count as "opening the lid".
const TILT_THRESHOLD = 22

// Only offer tilt-to-open on touch devices that expose orientation — desktops
// define DeviceOrientationEvent but never fire it, so the button would be dead.
const tiltAvailable =
  typeof window !== 'undefined' &&
  'DeviceOrientationEvent' in window &&
  (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)

// The powered-off screen: a black void with a glowing power button. Clicking it
// (or pressing Enter/Space) is the user gesture that unlocks audio and boots. On
// a phone you can instead tilt the device, like lifting a MacBook lid.
export default function OffScreen({ onPowerOn, onPrepareAudio, muted, onToggleMute }) {
  const btnRef = useRef(null)
  const baselineRef = useRef(null)
  const [tiltArmed, setTiltArmed] = useState(false)
  const [tiltError, setTiltError] = useState('')

  // Autofocus the power button so the keyboard (Enter/Space) works immediately.
  useEffect(() => {
    btnRef.current?.focus()
  }, [])

  // Once armed, boot when the device tilts past the threshold from its baseline.
  useEffect(() => {
    if (!tiltArmed) return undefined
    baselineRef.current = null
    let fired = false
    const onOrient = (e) => {
      if (e.beta == null) return
      if (baselineRef.current == null) {
        baselineRef.current = e.beta
        return
      }
      if (!fired && Math.abs(e.beta - baselineRef.current) > TILT_THRESHOLD) {
        fired = true
        onPowerOn()
      }
    }
    window.addEventListener('deviceorientation', onOrient)
    return () => window.removeEventListener('deviceorientation', onOrient)
  }, [tiltArmed, onPowerOn])

  const enableTilt = useCallback(async () => {
    // Unlock audio on this tap so a later tilt-triggered boot can still sound.
    onPrepareAudio?.()
    try {
      const DOE = window.DeviceOrientationEvent
      if (DOE && typeof DOE.requestPermission === 'function') {
        const res = await DOE.requestPermission() // iOS 13+ permission gate
        if (res !== 'granted') {
          setTiltError('Motion access denied — use the power button.')
          return
        }
      }
      setTiltArmed(true)
    } catch {
      setTiltError("This device can't detect tilt — use the power button.")
    }
  }, [onPrepareAudio])

  return (
    <div className="off">
      <button
        type="button"
        className="off__power"
        ref={btnRef}
        onClick={onPowerOn}
        aria-label="Power on"
      >
        <span className="off__power-glyph" aria-hidden="true">
          &#x23FB;
        </span>
      </button>

      <p className="off__title">Click to start up your Mac</p>
      <p className="off__hint">or press the spacebar</p>

      {tiltAvailable && (
        <div className="off__tilt">
          {tiltArmed ? (
            <p className="off__tilt-armed">Tilt your device to open the lid&hellip;</p>
          ) : (
            <button type="button" className="off__tilt-btn" onClick={enableTilt}>
              <span aria-hidden="true">&#x1F4F1;</span> Tilt to open
            </button>
          )}
          {tiltError && <p className="off__tilt-error">{tiltError}</p>}
        </div>
      )}

      <button
        type="button"
        className="off__mute"
        onClick={(e) => {
          e.stopPropagation()
          onToggleMute()
        }}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute startup chime' : 'Mute startup chime'}
        title={muted ? 'Startup chime: off' : 'Startup chime: on'}
      >
        {muted ? '\u{1F507}' : '\u{1F50A}'}
      </button>
    </div>
  )
}
