import { useCallback, useEffect, useRef, useState } from 'react'
import AppleLogo from './AppleLogo'
import './MacBook.css'

const DRAG_OPEN_PX = 60 // upward drag/swipe that starts opening the lid
const WHEEL_OPEN_PX = 120 // accumulated scroll that opens the lid
const TILT_THRESHOLD = 16 // degrees of tilt (phones) that open the lid

const hasOrientation = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
const isTouch =
  typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)

// Keyboard key layout (counts per row) for a believable deck.
const KEY_ROWS = [13, 13, 13, 12, 11, 8]

// A 3D MacBook you open like the real thing: drag/click/scroll up (or tilt a
// phone) to lift the lid — the screen powers on, the chime plays, then it hands
// off to the boot sequence. Browsers can't read a real laptop's hinge, so the
// on-screen lid is the cross-device equivalent.
export default function MacBook({ onPrepareAudio, onChime, onOpened, muted, onToggleMute }) {
  const sceneRef = useRef(null)
  const dragStartRef = useRef(null)
  const wheelAccRef = useRef(0)
  const baselineRef = useRef(null)
  const openedRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)
  const [lit, setLit] = useState(false)
  const [tiltArmed, setTiltArmed] = useState(false)

  useEffect(() => {
    sceneRef.current?.focus()
  }, [])

  // The open sequence: lift the lid, power on + chime mid-swing, then hand off.
  const open = useCallback(() => {
    if (openedRef.current) return
    openedRef.current = true
    onPrepareAudio?.()
    setIsOpen(true)
    const t1 = setTimeout(() => {
      setLit(true)
      onChime?.()
    }, 460)
    const t2 = setTimeout(() => onOpened?.(), 1750)
    open.timers = [t1, t2]
  }, [onPrepareAudio, onChime, onOpened])

  useEffect(() => () => (open.timers || []).forEach(clearTimeout), [open])

  // Tilt (phones): open when tilted past the threshold from the baseline.
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
    onPrepareAudio?.()
    try {
      const DOE = window.DeviceOrientationEvent
      if (DOE && typeof DOE.requestPermission === 'function') {
        const res = await DOE.requestPermission()
        if (res !== 'granted') return
      }
      setTiltArmed(true)
    } catch {
      /* tilt unavailable — drag/click still works */
    }
  }, [onPrepareAudio])

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
  const onWheel = (e) => {
    onPrepareAudio?.()
    wheelAccRef.current += Math.abs(e.deltaY)
    if (wheelAccRef.current > WHEEL_OPEN_PX) open()
  }
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open()
    }
  }

  return (
    <div
      className="mb-scene"
      ref={sceneRef}
      role="button"
      tabIndex={0}
      aria-label="Open the MacBook to start it up"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
      onClick={open}
      onKeyDown={onKeyDown}
    >
      <div className={`mb${isOpen ? ' is-open' : ''}${lit ? ' is-lit' : ''}`}>
        <div className="mb__deck">
          <div className="mb__keyboard">
            {KEY_ROWS.map((count, r) => (
              <div className="mb__key-row" key={r}>
                {Array.from({ length: count }).map((_, k) => (
                  <span className="mb__key" key={k} />
                ))}
              </div>
            ))}
          </div>
          <div className="mb__trackpad" />
        </div>
        <div className="mb__lid">
          <div className="mb__shell">
            <AppleLogo className="mb__shell-logo" color="#dfe1e5" />
          </div>
          <div className="mb__screen">
            <div className="mb__notch" />
            <div className="mb__display">
              <AppleLogo className="mb__display-logo" color="#ffffff" />
            </div>
          </div>
        </div>
      </div>

      {!isOpen && (
        <p className="mb-hint">
          {isTouch ? 'Swipe up to open' : 'Drag up — or click — to open the lid'}
        </p>
      )}

      {hasOrientation && isTouch && !isOpen && !tiltArmed && (
        <button
          type="button"
          className="mb-tilt"
          onClick={(e) => {
            e.stopPropagation()
            enableTilt()
          }}
        >
          <span aria-hidden="true">&#x1F4F1;</span> Enable tilt to open
        </button>
      )}

      <button
        type="button"
        className="mb-mute"
        onClick={(e) => {
          e.stopPropagation()
          onToggleMute()
        }}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute startup chime' : 'Mute startup chime'}
      >
        {muted ? '\u{1F507}' : '\u{1F50A}'}
      </button>
    </div>
  )
}
