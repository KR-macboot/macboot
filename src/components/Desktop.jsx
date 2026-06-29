import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppleLogo from './AppleLogo'
import Wallpaper, { WALLPAPERS } from './Wallpaper'
import Window from './Window'
import { appConfig } from './DesktopApps'
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

// Control Center popover: working wallpaper switcher + brightness, plus a few
// decorative toggle tiles.
function ControlCenterPanel({ wallpaper, setWallpaper, brightness, setBrightness }) {
  const [t, setT] = useState({ wifi: true, bt: true, dnd: false })
  const flip = (k) => setT((s) => ({ ...s, [k]: !s[k] }))
  return (
    <div className="cc" role="dialog" aria-label="Control Center">
      <div className="cc__grid">
        <button type="button" className={`cc__tile${t.wifi ? ' is-on' : ''}`} onClick={() => flip('wifi')}>
          <span className="cc__tile-icon">&#x1F4F6;</span> Wi-Fi
        </button>
        <button type="button" className={`cc__tile${t.bt ? ' is-on' : ''}`} onClick={() => flip('bt')}>
          <span className="cc__tile-icon">&#x1F535;</span> Bluetooth
        </button>
      </div>
      <button type="button" className={`cc__wide${t.dnd ? ' is-on' : ''}`} onClick={() => flip('dnd')}>
        <span className="cc__tile-icon">&#x1F319;</span> Do Not Disturb
      </button>
      <div className="cc__card">
        <div className="cc__label">Display</div>
        <div className="cc__slider">
          <span className="cc__sun">&#x2600;&#xFE0F;</span>
          <input
            type="range"
            min="0.35"
            max="1"
            step="0.01"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            aria-label="Brightness"
          />
        </div>
      </div>
      <div className="cc__card">
        <div className="cc__label">Wallpaper</div>
        <div className="cc__wall">
          {WALLPAPERS.map((w) => (
            <button
              type="button"
              key={w}
              className={`cc__sw cc__sw--${w}${wallpaper === w ? ' is-active' : ''}`}
              onClick={() => setWallpaper(w)}
              aria-label={w}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// The macOS desktop shown after boot: wallpaper, translucent menu bar (with a
// working Apple menu), and a magnifying Dock.
export default function Desktop({ onRestart, onShutDown }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tip, setTip] = useState(true)
  const menuRef = useRef(null)
  const ccRef = useRef(null)
  const now = useClock()

  // --- Appearance + system UI ---
  const [wallpaper, setWallpaper] = useState('dusk')
  const [brightness, setBrightness] = useState(1)
  const [ccOpen, setCcOpen] = useState(false)
  const [spotOpen, setSpotOpen] = useState(false)
  const [query, setQuery] = useState('')

  // --- Window manager: open/focus/close/min/max app windows from the Dock ---
  const [wins, setWins] = useState([])
  const idRef = useRef(0)
  const zRef = useRef(10)

  const focusWin = useCallback((id) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++zRef.current } : w)))
  }, [])
  const closeWin = useCallback((id) => {
    setWins((ws) => ws.filter((w) => w.id !== id))
  }, [])
  const minimizeWin = useCallback((id) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w)))
  }, [])
  const maximizeWin = useCallback((id) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: !w.max, z: ++zRef.current } : w)))
  }, [])
  const openApp = useCallback((app) => {
    setWins((ws) => {
      const existing = ws.find((w) => w.app === app)
      if (existing) {
        return ws.map((w) => (w.id === existing.id ? { ...w, min: false, z: ++zRef.current } : w))
      }
      const offset = (ws.length % 6) * 26
      return [
        ...ws,
        { id: ++idRef.current, app, z: ++zRef.current, x: 120 + offset, y: 64 + offset },
      ]
    })
  }, [])
  const openApps = new Set(wins.map((w) => w.app))

  // Spotlight: searchable apps + system actions.
  const allApps = useMemo(() => [...DOCK_APPS.map((a) => a.name), 'Trash'], [])
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const apps = (q ? allApps.filter((n) => n.toLowerCase().includes(q)) : allApps).map((name) => ({
      label: name,
      kind: 'Application',
      run: () => openApp(name),
    }))
    const actions = [
      { label: 'Restart', kind: 'System', run: onRestart },
      { label: 'Shut Down', kind: 'System', run: onShutDown },
    ].filter((a) => !q || a.label.toLowerCase().includes(q))
    return [...apps, ...actions]
  }, [query, allApps, openApp, onRestart, onShutDown])

  const runSpot = useCallback((item) => {
    setSpotOpen(false)
    setQuery('')
    item?.run?.()
  }, [])

  // ⌘/Ctrl+Space toggles Spotlight; Escape closes overlays.
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSpotOpen((v) => !v)
        setCcOpen(false)
      } else if (e.key === 'Escape') {
        setSpotOpen(false)
        setCcOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
    if (!ccOpen) return undefined
    const onDown = (e) => {
      if (ccRef.current && !ccRef.current.contains(e.target)) setCcOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ccOpen])

  useEffect(() => {
    const t = setTimeout(() => setTip(false), 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="desktop">
      <Wallpaper variant={wallpaper} />

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
          <button
            type="button"
            className="menubar__status menubar__btn"
            onClick={() => {
              setSpotOpen(true)
              setCcOpen(false)
            }}
            aria-label="Spotlight Search"
          >
            <Search />
          </button>
          <div className="menubar__cc" ref={ccRef}>
            <button
              type="button"
              className="menubar__status menubar__btn"
              onClick={() => setCcOpen((v) => !v)}
              aria-label="Control Center"
            >
              <ControlCenter />
            </button>
            {ccOpen && (
              <ControlCenterPanel
                wallpaper={wallpaper}
                setWallpaper={setWallpaper}
                brightness={brightness}
                setBrightness={setBrightness}
              />
            )}
          </div>
          <span className="menubar__clock">{formatClock(now)}</span>
        </div>
      </div>

      {tip && (
        <div className="desktop__tip" role="status">
          Tip: open the&nbsp;<AppleLogo className="desktop__tip-logo" color="#fff" />&nbsp;menu to
          Restart or Shut Down.
        </div>
      )}

      {/* App windows */}
      {wins.map((w) => {
        const cfg = appConfig(w.app)
        return (
          <Window
            key={w.id}
            title={cfg.title}
            z={w.z}
            initialX={w.x}
            initialY={w.y}
            width={cfg.w}
            height={cfg.h}
            minimized={w.min}
            maximized={w.max}
            onClose={() => closeWin(w.id)}
            onMinimize={() => minimizeWin(w.id)}
            onMaximize={() => maximizeWin(w.id)}
            onFocus={() => focusWin(w.id)}
          >
            {cfg.render()}
          </Window>
        )
      })}

      {/* Brightness dim (Control Center) */}
      <div className="desktop__dim" style={{ opacity: 1 - brightness }} />

      {/* Spotlight */}
      {spotOpen && (
        <div className="spot" onMouseDown={() => setSpotOpen(false)}>
          <div className="spot__box" onMouseDown={(e) => e.stopPropagation()}>
            <div className="spot__search">
              <Search />
              <input
                className="spot__input"
                autoFocus
                placeholder="Spotlight Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runSpot(results[0])
                }}
              />
            </div>
            {results.length > 0 && (
              <div className="spot__list">
                {results.slice(0, 7).map((r) => (
                  <button
                    type="button"
                    className="spot__item"
                    key={r.kind + r.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => runSpot(r)}
                  >
                    <span className="spot__label">{r.label}</span>
                    <span className="spot__kind">{r.kind}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dock */}
      <div className="dock">
        <div className="dock__panel">
          {DOCK_APPS.map(({ name, Icon }) => (
            <button
              type="button"
              className="dock__app"
              key={name}
              aria-label={name}
              onClick={() => openApp(name)}
            >
              <span className="dock__tooltip">{name}</span>
              <span className="dock__tile">
                <Icon />
              </span>
              {openApps.has(name) && <span className="dock__dot" aria-hidden="true" />}
            </button>
          ))}
          <span className="dock__sep" aria-hidden="true" />
          <button
            type="button"
            className="dock__app"
            aria-label="Trash"
            onClick={() => openApp('Trash')}
          >
            <span className="dock__tooltip">Trash</span>
            <span className="dock__tile">
              <Trash />
            </span>
            {openApps.has('Trash') && <span className="dock__dot" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}
