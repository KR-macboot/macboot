// Simplified-but-recognizable macOS-style app icons, drawn as self-contained SVG
// tiles (a rounded-square gradient background + a glyph). Far cleaner and more
// consistent than emoji. Each app appears once, so the gradient ids are unique.

const Tile = ({ id, from, to, children }) => (
  <svg viewBox="0 0 64 64" className="dock__svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={id} x1="32" y1="3" x2="32" y2="61" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={from} />
        <stop offset="1" stopColor={to} />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill={`url(#${id})`} />
    {children}
  </svg>
)

const Finder = () => (
  <Tile id="g-finder" from="#4aa8ff" to="#1f6fe0">
    <rect x="3" y="3" width="29" height="58" rx="14" fill="rgba(255,255,255,0.16)" />
    <circle cx="23" cy="27" r="2.5" fill="#fff" />
    <circle cx="41" cy="27" r="2.5" fill="#fff" />
    <path d="M23 40 q9 7 18 0" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
  </Tile>
)

const Safari = () => (
  <Tile id="g-safari" from="#1ec7ff" to="#0a7fe0">
    <circle cx="32" cy="32" r="21" fill="#eaf6ff" />
    <circle cx="32" cy="32" r="21" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
    <path d="M32 32 L45 19 L36 30 Z" fill="#ff3b30" />
    <path d="M32 32 L19 45 L28 34 Z" fill="#c8d2dc" />
  </Tile>
)

const Messages = () => (
  <Tile id="g-msg" from="#5cf06f" to="#19c247">
    <path
      d="M32 17 C20.4 17 14 24 14 31 C14 38 20.4 44 30 44 L31 44 L27 50 L37 43.4 C45 41 50 36 50 31 C50 24 43.6 17 32 17 Z"
      fill="#fff"
    />
  </Tile>
)

const Mail = () => (
  <Tile id="g-mail" from="#3ab4ff" to="#1f7be0">
    <rect x="13" y="20" width="38" height="24" rx="5" fill="#fff" />
    <path d="M14.5 23 L32 36 L49.5 23" fill="none" stroke="#a7cdf0" strokeWidth="2.4" />
  </Tile>
)

const Maps = () => (
  <Tile id="g-maps" from="#86d873" to="#43ad67">
    <path d="M3 45 L24 37 L40 45 L61 37 L61 61 L3 61 Z" fill="rgba(255,255,255,0.22)" />
    <path d="M14 30 L50 22" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 5" />
    <path d="M34 14 c-7 0 -12 5 -12 11 c0 8 12 19 12 19 s12 -11 12 -19 c0 -6 -5 -11 -12 -11 Z" fill="#ff453a" />
    <circle cx="34" cy="25" r="4" fill="#fff" />
  </Tile>
)

const PHOTO_PETALS = [
  ['#ff5b5b', 0],
  ['#ff9f43', 45],
  ['#ffd23f', 90],
  ['#54d66a', 135],
  ['#27c4c4', 180],
  ['#2e8bff', 225],
  ['#7a5cff', 270],
  ['#ff5bbd', 315],
]
const Photos = () => (
  <Tile id="g-photos" from="#ffffff" to="#eef0f3">
    {PHOTO_PETALS.map(([c, a]) => (
      <ellipse key={a} cx="32" cy="20" rx="6.5" ry="12" fill={c} opacity="0.9" transform={`rotate(${a} 32 32)`} />
    ))}
    <circle cx="32" cy="32" r="4.5" fill="#fff" />
  </Tile>
)

const Music = () => (
  <Tile id="g-music" from="#fb5c74" to="#e01b4b">
    <path d="M29 43 V20 L46 16.5 V38" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinejoin="round" />
    <circle cx="25" cy="43" r="5.2" fill="#fff" />
    <circle cx="42" cy="38" r="5.2" fill="#fff" />
  </Tile>
)

const Calendar = () => (
  <Tile id="g-cal" from="#ffffff" to="#eef0f3">
    <path d="M3 19 V17 A14 14 0 0 1 17 3 H47 A14 14 0 0 1 61 17 V19 Z" fill="#ff453a" />
    <text x="32" y="15" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" fontFamily="sans-serif">
      MON
    </text>
    <text x="32" y="50" textAnchor="middle" fontSize="27" fontWeight="600" fill="#1d1d1f" fontFamily="sans-serif">
      17
    </text>
  </Tile>
)

const Settings = () => (
  <Tile id="g-set" from="#cfd5dd" to="#8b929b">
    {Array.from({ length: 8 }).map((_, i) => (
      <rect key={i} x="29.5" y="6" width="5" height="11" rx="2.5" fill="#fdfdfd" transform={`rotate(${i * 45} 32 32)`} />
    ))}
    <circle cx="32" cy="32" r="13" fill="#fdfdfd" />
    <circle cx="32" cy="32" r="6" fill="#8b929b" />
  </Tile>
)

const Terminal = () => (
  <Tile id="g-term" from="#3a3a3c" to="#1b1b1d">
    <path d="M17 23 L26 31 L17 39" fill="none" stroke="#36d35f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M29 39 H42" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </Tile>
)

const Trash = () => (
  <Tile id="g-trash" from="#eef2f7" to="#d3dae2">
    <path d="M18 24 H46" stroke="#5b6470" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M27 22 q5 -4 10 0" fill="none" stroke="#5b6470" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M22 26 H42 L40 48 A3 3 0 0 1 37 51 H27 A3 3 0 0 1 24 48 Z" fill="none" stroke="#5b6470" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M30 31 V46 M34 31 V46" stroke="#5b6470" strokeWidth="2" strokeLinecap="round" />
  </Tile>
)

// Apps shown in the Dock (Trash is rendered separately, after a divider).
export const DOCK_APPS = [
  { name: 'Finder', Icon: Finder, running: true },
  { name: 'Safari', Icon: Safari },
  { name: 'Messages', Icon: Messages },
  { name: 'Mail', Icon: Mail },
  { name: 'Maps', Icon: Maps },
  { name: 'Photos', Icon: Photos },
  { name: 'Music', Icon: Music },
  { name: 'Calendar', Icon: Calendar },
  { name: 'System Settings', Icon: Settings },
  { name: 'Terminal', Icon: Terminal },
]

export { Trash }
