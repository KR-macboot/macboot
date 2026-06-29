import { useEffect, useRef } from 'react'
import './OffScreen.css'

// The powered-off screen: a black void with a glowing power button. Clicking it (or
// pressing Enter/Space while focused) is the user gesture that unlocks audio and
// starts the boot sequence.
export default function OffScreen({ onPowerOn, muted, onToggleMute }) {
  const btnRef = useRef(null)

  // Autofocus the power button so the keyboard (Enter/Space) works immediately.
  useEffect(() => {
    btnRef.current?.focus()
  }, [])

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
