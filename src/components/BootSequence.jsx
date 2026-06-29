import { useEffect, useState } from 'react'
import AppleLogo from './AppleLogo'
import './BootSequence.css'

// Boot timeline (compressed from a real ~15-20s boot to a snappy web-friendly one).
const BAR_APPEAR_MS = 1000 // progress bar fades in after the logo settles
const FILL_DURATION_MS = 4200 // how long the bar takes to fill
const HOLD_MS = 550 // pause on full bar before handing off to the desktop

// Monotonic ease for the progress fill: a blend of linear + smoothstep so it
// advances steadily but eases as it approaches 100% (feels organic, never stalls).
function easeBoot(t) {
  const smooth = t * t * (3 - 2 * t)
  return 0.5 * t + 0.5 * smooth
}

// The black boot screen: Apple logo fades in, then a pill progress bar fills and
// hands off to the desktop.
export default function BootSequence({ onComplete }) {
  const [logoIn, setLogoIn] = useState(false)
  const [barVisible, setBarVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timers = []
    let fillRaf = 0
    let startTs = null

    // Fade the logo in on the next frame so the CSS transition actually runs.
    const introRaf = requestAnimationFrame(() => setLogoIn(true))

    const tick = (ts) => {
      if (startTs === null) startTs = ts
      const t = Math.min(1, (ts - startTs) / FILL_DURATION_MS)
      setProgress(easeBoot(t) * 100)
      if (t < 1) {
        fillRaf = requestAnimationFrame(tick)
      } else {
        timers.push(setTimeout(() => onComplete?.(), HOLD_MS))
      }
    }

    timers.push(
      setTimeout(() => {
        setBarVisible(true)
        fillRaf = requestAnimationFrame(tick)
      }, BAR_APPEAR_MS),
    )

    return () => {
      cancelAnimationFrame(introRaf)
      cancelAnimationFrame(fillRaf)
      timers.forEach(clearTimeout)
    }
  }, [onComplete])

  return (
    <div className="boot">
      <AppleLogo className={`boot__logo${logoIn ? ' boot__logo--in' : ''}`} color="#fff" />
      <div
        className={`boot__bar${barVisible ? ' boot__bar--in' : ''}`}
        role="progressbar"
        aria-label="Starting up"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="boot__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
