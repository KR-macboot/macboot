import { useEffect, useRef, useState } from 'react'

/* ----------------------------- Calculator ----------------------------- */
const CALC_KEYS = [
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]
const calc = (a, b, op) => {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '×') return a * b
  if (op === '÷') return b === 0 ? NaN : a / b
  return b
}
function Calculator() {
  const [display, setDisplay] = useState('0')
  const [acc, setAcc] = useState(null)
  const [op, setOp] = useState(null)
  const [fresh, setFresh] = useState(true)

  const press = (k) => {
    if (k === 'AC') {
      setDisplay('0')
      setAcc(null)
      setOp(null)
      setFresh(true)
    } else if (k === '+/-') {
      setDisplay((d) => (d.startsWith('-') ? d.slice(1) : d === '0' ? d : '-' + d))
    } else if (k === '%') {
      setDisplay((d) => String(parseFloat(d) / 100))
      setFresh(true)
    } else if (k === '.') {
      setDisplay((d) => (fresh ? '0.' : d.includes('.') ? d : d + '.'))
      setFresh(false)
    } else if ('+-×÷'.includes(k)) {
      const cur = parseFloat(display)
      if (acc === null) setAcc(cur)
      else if (!fresh) {
        const r = calc(acc, cur, op)
        setAcc(r)
        setDisplay(String(r))
      }
      setOp(k)
      setFresh(true)
    } else if (k === '=') {
      if (op !== null && acc !== null) {
        const r = calc(acc, parseFloat(display), op)
        setDisplay(String(r))
        setAcc(null)
        setOp(null)
        setFresh(true)
      }
    } else {
      setDisplay((d) => (fresh || d === '0' ? k : d + k))
      setFresh(false)
    }
  }

  return (
    <div className="calc">
      <div className="calc__display">{display}</div>
      <div className="calc__keys">
        {CALC_KEYS.flat().map((k) => (
          <button
            type="button"
            key={k}
            className={`calc__key${'+-×÷='.includes(k) ? ' calc__key--op' : ''}${
              k === '0' ? ' calc__key--zero' : ''
            }${['AC', '+/-', '%'].includes(k) ? ' calc__key--fn' : ''}`}
            onClick={() => press(k)}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------- Notes -------------------------------- */
function Notes() {
  const [text, setText] = useState(() => localStorage.getItem('macboot:note') || '')
  useEffect(() => {
    localStorage.setItem('macboot:note', text)
  }, [text])
  return (
    <textarea
      className="notes"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Type a note… (it's saved automatically)"
      spellCheck={false}
    />
  )
}

/* ------------------------------ Terminal ------------------------------ */
function Terminal() {
  const [lines, setLines] = useState(['Last login: welcome to macboot', 'Type "help" to get started.'])
  const [value, setValue] = useState('')
  const bodyRef = useRef(null)
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines])

  const run = (raw) => {
    const cmd = raw.trim()
    const echo = `➜  ~ ${raw}`
    if (cmd === 'clear') return setLines([])
    let out = ''
    if (cmd === '') out = ''
    else if (cmd === 'help') out = 'available: help, date, echo <text>, whoami, uname, ls, clear'
    else if (cmd === 'date') out = new Date().toString()
    else if (cmd === 'whoami') out = 'guest'
    else if (cmd === 'uname') out = 'Darwin macboot 24.0.0 arm64'
    else if (cmd === 'ls') out = 'Applications  Desktop  Documents  Downloads'
    else if (cmd.startsWith('echo ')) out = raw.slice(raw.indexOf('echo ') + 5)
    else out = `zsh: command not found: ${cmd}`
    setLines((l) => [...l, echo, ...(out ? [out] : [])])
  }

  return (
    <div className="term" ref={bodyRef} onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      {lines.map((l, i) => (
        <div className="term__line" key={i}>
          {l}
        </div>
      ))}
      <div className="term__line term__prompt">
        <span className="term__arrow">➜&nbsp;&nbsp;~</span>
        <input
          className="term__input"
          value={value}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              run(value)
              setValue('')
            }
          }}
        />
      </div>
    </div>
  )
}

/* ------------------------------ Calendar ------------------------------ */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function CalendarApp() {
  const today = new Date()
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const first = new Date(view.y, view.m, 1).getDay()
  const days = new Date(view.y, view.m + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const shift = (d) => {
    const m = view.m + d
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 })
  }
  const isToday = (d) =>
    d === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear()
  return (
    <div className="cal">
      <div className="cal__head">
        <button type="button" className="cal__nav" onClick={() => shift(-1)} aria-label="Previous month">
          ‹
        </button>
        <span className="cal__title">
          {MONTHS[view.m]} {view.y}
        </span>
        <button type="button" className="cal__nav" onClick={() => shift(1)} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="cal__grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div className="cal__dow" key={i}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => (
          <div className={`cal__cell${d && isToday(d) ? ' cal__cell--today' : ''}`} key={i}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------- Finder ------------------------------- */
const FINDER_SIDEBAR = ['AirDrop', 'Recents', 'Applications', 'Desktop', 'Documents', 'Downloads']
const FINDER_ITEMS = ['Applications', 'Desktop', 'Documents', 'Downloads', 'Movies', 'Music', 'Pictures', 'Public']
function Finder() {
  const [sel, setSel] = useState('Desktop')
  return (
    <div className="finder">
      <div className="finder__side">
        <div className="finder__group">Favorites</div>
        {FINDER_SIDEBAR.map((s) => (
          <button
            type="button"
            key={s}
            className={`finder__sideitem${sel === s ? ' is-active' : ''}`}
            onClick={() => setSel(s)}
          >
            <span className="finder__folder" aria-hidden="true">
              📁
            </span>
            {s}
          </button>
        ))}
      </div>
      <div className="finder__main">
        {FINDER_ITEMS.map((f) => (
          <div className="finder__item" key={f}>
            <span className="finder__icon" aria-hidden="true">
              📁
            </span>
            <span className="finder__name">{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------- Safari ------------------------------- */
const BOOKMARKS = [
  { name: 'Apple', url: 'https://www.apple.com', emoji: '\u{1F34E}' },
  { name: 'GitHub', url: 'https://github.com', emoji: '\u{1F431}' },
  { name: 'Wikipedia', url: 'https://wikipedia.org', emoji: '\u{1F4D6}' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', emoji: '\u{1F4F0}' },
]
function Safari() {
  return (
    <div className="safari">
      <div className="safari__bar">
        <span className="safari__url">Favorites</span>
      </div>
      <div className="safari__start">
        {BOOKMARKS.map((b) => (
          <a className="safari__bm" key={b.name} href={b.url} target="_blank" rel="noreferrer">
            <span className="safari__bm-icon" aria-hidden="true">
              {b.emoji}
            </span>
            <span>{b.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

/* --------------------------- Generic / Trash -------------------------- */
function Placeholder({ name, emoji }) {
  return (
    <div className="ph">
      <div className="ph__icon" aria-hidden="true">
        {emoji}
      </div>
      <div className="ph__name">{name}</div>
      <div className="ph__note">This is a demo app — content coming soon.</div>
    </div>
  )
}

// Registry: app name → window config. Apps not listed fall back to a placeholder.
export const APP_REGISTRY = {
  Calculator: { title: 'Calculator', w: 250, h: 360, render: () => <Calculator /> },
  Notes: { title: 'Notes', w: 420, h: 320, render: () => <Notes /> },
  Terminal: { title: 'Terminal — zsh', w: 480, h: 320, render: () => <Terminal /> },
  Calendar: { title: 'Calendar', w: 360, h: 340, render: () => <CalendarApp /> },
  Finder: { title: 'Finder', w: 520, h: 340, render: () => <Finder /> },
  Safari: { title: 'Safari', w: 520, h: 360, render: () => <Safari /> },
}

const FALLBACK_EMOJI = {
  Messages: '\u{1F4AC}',
  Mail: '✉️',
  Maps: '\u{1F5FA}️',
  Photos: '\u{1F308}',
  Music: '\u{1F3B5}',
  'System Settings': '⚙️',
  Trash: '\u{1F5D1}️',
}

export function appConfig(name) {
  if (APP_REGISTRY[name]) return APP_REGISTRY[name]
  return {
    title: name,
    w: 380,
    h: 280,
    render: () => <Placeholder name={name} emoji={FALLBACK_EMOJI[name] || '\u{1F5C2}️'} />,
  }
}
