import { useCallback, useEffect, useRef, useState } from 'react'
import './OffScreen.css'

// Degrees of front-back tilt (from the armed baseline) that count as "opening the lid".
const TILT_THRESHOLD = 16
const DRAG_OPEN_PX = 70 // upward drag/swipe distance that opens the lid
const WHEEL_OPEN_PX = 120 // accumulated scroll that opens the lid (trackpad/mouse)

const hasOrientation = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
const isTouch =
  typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)

// The powered-off screen. "Open the lid" to boot — drag/swipe up (works on a laptop
// trackpad/mouse and on touch), scroll up, or, on a phone, tilt the device. A power
// button (click / Enter / Space) is always there as a fallback. Browsers can't read a
// real laptop's hinge angle, so the drag/scroll gesture is the laptop equivalent.
export default function OffScreen({ onPowerOn, onPrepareAudio, muted, onToggleMute }) {
  const btnRef = useRef(null)
  const dragStartRef = useRef(null)
  const wheelAccRef = useRef(0)
  const firedRef = useRef(false)
  const baselineRef = useRef(null)
  const [tiltArmed, setTiltArmed] = useState(false)
  const [tiltError, setTiltError] = useState('')

  useEffect(() => {
    btnRef.current?.focus()
  }, [])

  const open = useCallback(() => {
    if (firedRef.current) return
    firedRef.current = true
    onPowerOn()
  }, [onPowerOn])

  // Tilt (sensor devices): boot when tilted past the threshold from the baseline.
  useEffect(() => {
    if (!tiltArmed) return undefined
    baselineRef.current = null
    const onOrient = (e) => {
      if (e.beta == null) return
      if (baselineRef.current == null) {
        baselineRef.current = e.beta
        return
      }
      if (Math.abs(e.beta - baselineRef.current) > TILT_THRESHOLD) open()
    }
    window.addEventListener('deviceorientation', onOrient)
    return () => window.removeEventListener('deviceorientation', onOrient)
  }, [tiltArmed, open])

  const enableTilt = useCallback(async () => {
    onPrepareAudio?.() // unlock audio on this tap so a tilt-triggered boot can sound
    try {
      const DOE = window.DeviceOrientationEvent
      if (DOE && typeof DOE.requestPermission === 'function') {
        const res = await DOE.requestPermission() // iOS 13+ permission gate
        if (res !== 'granted') {
          setTiltError('Motion access denied — drag up or use the power button.')
          return
        }
      }
      setTiltArmed(true)
    } catch {
      setTiltError("Tilt isn't available — drag up or use the power button.")
    }
  }, [onPrepareAudio])

  // Drag the lid up to open (mouse, trackpad click-drag, or touch).
  const onPointerDown = (e) => {
    dragStartRef.current = e.clientY
    onPrepareAudio?.()
  }
  const onPointerMove = (e) => {
    if (dragStartRef.current == null) return
    if (dragStartRef.current - e.clientY > DRAG_OPEN_PX) {
      dragStartRef.current = null
      open()
    }
  }
  const endDrag = () => {
    dragStartRef.current = null
  }

  // Scroll/swipe up on a trackpad or wheel to open.
  const onWheel = (e) => {
    onPrepareAudio?.()
    wheelAccRef.current += Math.abs(e.deltaY)
    if (wheelAccRef.current > WHEEL_OPEN_PX) open()
  }

  return (
    <div
      className="off"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
    >
      <button
        type="button"
        className="off__power"
        ref={btnRef}
        onClick={open}
        aria-label="Power on"
      >
        <span className="off__power-glyph" aria-hidden="true">
          &#x23FB;
        </span>
      </button>

      <p className="off__title">Open your Mac</p>
      <p className="off__hint">
        drag up{isTouch ? ', swipe, or tilt' : ' or scroll'} to lift the lid — or click the power
        button
      </p>

      {hasOrientation && isTouch && (
        <div className="off__tilt">
          {tiltArmed ? (
            <p className="off__tilt-armed">Tilt your device to open the lid&hellip;</p>
          ) : (
            <button type="button" className="off__tilt-btn" onClick={enableTilt}>
              <span aria-hidden="true">&#x1F4F1;</span> Enable tilt
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
