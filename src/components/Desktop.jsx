import { useEffect, useRef, useState } from 'react'
import AppleLogo from './AppleLogo'
import './Desktop.css'

// Dock apps — rounded-square gradient tiles with an emoji glyph, magnified on hover.
const DOCK_APPS = [
  { name: 'Finder', emoji: '\u{1F4BB}', bg: 'linear-gradient(160deg,#3aa0ff,#1f6fd6)', running: true },
  { name: 'Launchpad', emoji: '\u{1F680}', bg: 'linear-gradient(160deg,#9aa3ad,#5c656e)' },
  { name: 'Safari', emoji: '\u{1F9ED}', bg: 'linear-gradient(160deg,#e8f3ff,#bcd9ff)' },
  { name: 'Messages', emoji: '\u{1F4AC}', bg: 'linear-gradient(160deg,#5ff07a,#1fb84a)' },
  { name: 'Mail', emoji: '✉️', bg: 'linear-gradient(160deg,#3aa0ff,#1f6fd6)' },
  { name: 'Maps', emoji: '\u{1F5FA}️', bg: 'linear-gradient(160deg,#a8e6a0,#5cc16a)' },
  { name: 'Photos', emoji: '\u{1F308}', bg: 'linear-gradient(160deg,#ffffff,#f0f0f3)' },
  { name: 'Music', emoji: '\u{1F3B5}', bg: 'linear-gradient(160deg,#fb5c74,#e21b4c)' },
  { name: 'Calendar', emoji: '\u{1F4C5}', bg: 'linear-gradient(160deg,#ffffff,#eef0f3)' },
  { name: 'Notes', emoji: '\u{1F4DD}', bg: 'linear-gradient(160deg,#fff1a8,#ffd84d)' },
  { name: 'Settings', emoji: '⚙️', bg: 'linear-gradient(160deg,#c2c8d0,#878f99)' },
]

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    // Tick at the top of each minute, then every minute after.
    let interval
    const align = setTimeout(
      () => {
        setNow(new Date())
        interval = setInterval(() => setNow(new Date()), 60_000)
      },
      (60 - new Date().getSeconds()) * 1000,
    )
    return () => {
      clearTimeout(align)
      clearInterval(interval)
    }
  }, [])
  return now
}

function formatClock(d) {
  const day = d.toLocaleDateString(undefined, { weekday: 'short' })
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${day} ${date}  ${time}`
}

// The macOS desktop shown after boot: wallpaper, translucent menu bar (with a
// working Apple menu), and a magnifying Dock.
export default function Desktop({ onRestart, onShutDown }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tip, setTip] = useState(true)
  const menuRef = useRef(null)
  const now = useClock()

  // Close the Apple menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Auto-dismiss the first-run tip.
  useEffect(() => {
    const t = setTimeout(() => setTip(false), 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="desktop">
      {/* Menu bar */}
      <div className="menubar">
        <div className="menubar__left">
          <div className="menubar__apple" ref={menuRef}>
            <button
              type="button"
              className={`menubar__item menubar__apple-btn${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Apple menu"
            >
              <AppleLogo className="menubar__logo" color="#1d1d1f" title="Apple menu" />
            </button>
            {menuOpen && (
              <div className="apple-menu" role="menu">
                <button className="apple-menu__row" role="menuitem" disabled>
                  About This Mac
                </button>
                <div className="apple-menu__sep" />
                <button
                  className="apple-menu__row"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onRestart()
                  }}
                >
                  Restart&hellip;
                </button>
                <button
                  className="apple-menu__row"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onShutDown()
                  }}
                >
                  Shut Down&hellip;
                </button>
              </div>
            )}
          </div>
          <span className="menubar__item menubar__app">Finder</span>
          <span className="menubar__item menubar__menu">File</span>
          <span className="menubar__item menubar__menu">Edit</span>
          <span className="menubar__item menubar__menu">View</span>
          <span className="menubar__item menubar__menu">Go</span>
          <span className="menubar__item menubar__menu">Window</span>
          <span className="menubar__item menubar__menu">Help</span>
        </div>
        <div className="menubar__right">
          <span className="menubar__status" aria-hidden="true">
            &#x1F50B;
          </span>
          <span className="menubar__status" aria-hidden="true">
            &#x1F4F6;
          </span>
          <span className="menubar__status" aria-hidden="true">
            &#x1F50D;
          </span>
          <span className="menubar__clock">{formatClock(now)}</span>
        </div>
      </div>

      {tip && (
        <div className="desktop__tip" role="status">
          Tip: open the&nbsp;<AppleLogo className="desktop__tip-logo" color="#fff" />&nbsp;menu to
          Restart or Shut Down.
        </div>
      )}

      {/* Dock */}
      <div className="dock">
        <div className="dock__panel">
          {DOCK_APPS.map((app) => (
            <button type="button" className="dock__app" key={app.name} aria-label={app.name}>
              <span className="dock__tooltip">{app.name}</span>
              <span className="dock__icon" style={{ background: app.bg }} aria-hidden="true">
                {app.emoji}
              </span>
              {app.running && <span className="dock__dot" aria-hidden="true" />}
            </button>
          ))}
          <span className="dock__sep" aria-hidden="true" />
          <button type="button" className="dock__app" aria-label="Trash">
            <span className="dock__tooltip">Trash</span>
            <span className="dock__icon dock__icon--trash" aria-hidden="true">
              {'\u{1F5D1}️'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
