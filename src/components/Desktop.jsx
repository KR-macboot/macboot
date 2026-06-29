import { useEffect, useRef, useState } from 'react'
import AppleLogo from './AppleLogo'
import { DOCK_APPS, Trash } from './DockIcons'
import './Desktop.css'

// --- Menu-bar status icons (small, monochrome, inherit menu-bar text color) ---
const ControlCenter = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" className="menubar__icon" aria-hidden="true">
    <rect x="2" y="3" width="12" height="4.3" rx="2.15" fill="none" stroke="currentColor" strokeWidth="1.1" />
    <circle cx="5" cy="5.15" r="1.25" fill="currentColor" />
    <rect x="2" y="8.7" width="12" height="4.3" rx="2.15" fill="none" stroke="currentColor" strokeWidth="1.1" />
    <circle cx="11" cy="10.85" r="1.25" fill="currentColor" />
  </svg>
)
const Wifi = () => (
  <svg width="16" height="13" viewBox="0 0 18 13" className="menubar__icon" aria-hidden="true">
    <circle cx="9" cy="10.6" r="1.4" fill="currentColor" />
    <path d="M3.4 5.6 a8 8 0 0 1 11.2 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5.7 7.9 a4.8 4.8 0 0 1 6.6 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const Battery = () => (
  <svg width="27" height="13" viewBox="0 0 28 13" className="menubar__icon" aria-hidden="true">
    <rect x="1" y="1.6" width="22" height="9.8" rx="3" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
    <rect x="2.6" y="3.2" width="15" height="6.6" rx="1.6" fill="currentColor" />
    <rect x="24.4" y="4.6" width="2" height="3.8" rx="1" fill="currentColor" opacity="0.55" />
  </svg>
)
const Search = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" className="menubar__icon" aria-hidden="true">
    <circle cx="7" cy="7" r="4.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M10.3 10.3 L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
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

  useEffect(() => {
    if (!menuOpen) return undefined
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

  useEffect(() => {
    const t = setTimeout(() => setTip(false), 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="desktop">
      <div className="desktop__wallpaper" />

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
              <AppleLogo className="menubar__logo" color="#f5f5f7" title="Apple menu" />
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
          <span className="menubar__status">
            <Battery />
          </span>
          <span className="menubar__status">
            <Wifi />
          </span>
          <span className="menubar__status">
            <Search />
          </span>
          <span className="menubar__status">
            <ControlCenter />
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
          {DOCK_APPS.map(({ name, Icon, running }) => (
            <button type="button" className="dock__app" key={name} aria-label={name}>
              <span className="dock__tooltip">{name}</span>
              <span className="dock__tile">
                <Icon />
              </span>
              {running && <span className="dock__dot" aria-hidden="true" />}
            </button>
          ))}
          <span className="dock__sep" aria-hidden="true" />
          <button type="button" className="dock__app" aria-label="Trash">
            <span className="dock__tooltip">Trash</span>
            <span className="dock__tile">
              <Trash />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
