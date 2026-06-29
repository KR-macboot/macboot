// macOS-style app icons drawn as original SVG art (rounded-square tile + glyph) —
// no image assets. Each app appears once, so gradient/clip ids stay unique.

const Svg = ({ children }) => (
  <svg viewBox="0 0 64 64" className="dock__svg" aria-hidden="true" focusable="false">
    {children}
  </svg>
)

const Finder = () => (
  <Svg>
    <defs>
      <linearGradient id="fi-l" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2f5fc4" />
        <stop offset="1" stopColor="#26429b" />
      </linearGradient>
      <linearGradient id="fi-r" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9ad2ff" />
        <stop offset="1" stopColor="#4ea3f5" />
      </linearGradient>
      <clipPath id="fi-clip">
        <rect x="3" y="3" width="58" height="58" rx="14" />
      </clipPath>
    </defs>
    <g clipPath="url(#fi-clip)">
      <rect x="3" y="3" width="29" height="58" fill="url(#fi-l)" />
      <rect x="32" y="3" width="29" height="58" fill="url(#fi-r)" />
      <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M22.5 23 v5.5" />
        <path d="M41.5 23 v5.5" />
        <path d="M22 41 q10 8.5 20 0" />
      </g>
    </g>
  </Svg>
)

const Safari = () => (
  <Svg>
    <defs>
      <radialGradient id="sa-bg" cx="0.5" cy="0.36" r="0.75">
        <stop offset="0" stopColor="#3cbcff" />
        <stop offset="1" stopColor="#0b6fd6" />
      </radialGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#sa-bg)" />
    <circle cx="32" cy="32" r="22" fill="#eaf4fb" />
    <circle cx="32" cy="32" r="20.5" fill="none" stroke="#9db4c6" strokeWidth="2.4" strokeDasharray="0.5 4.1" />
    <path d="M32 32 L45 19 L35 29 Z" fill="#f5453a" />
    <path d="M32 32 L19 45 L29 35 Z" fill="#c2d2df" />
    <circle cx="32" cy="32" r="1.8" fill="#fff" />
  </Svg>
)

const Messages = () => (
  <Svg>
    <defs>
      <linearGradient id="ms-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5cf06f" />
        <stop offset="1" stopColor="#15c043" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#ms-bg)" />
    <path
      d="M17 20 h30 a6 6 0 0 1 6 6 v10 a6 6 0 0 1 -6 6 h-15 l-9 6 v-6 h-1 a6 6 0 0 1 -6 -6 v-10 a6 6 0 0 1 6 -6 Z"
      fill="#fff"
    />
  </Svg>
)

const Mail = () => (
  <Svg>
    <defs>
      <linearGradient id="ma-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4ab6ff" />
        <stop offset="1" stopColor="#1f78e0" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#ma-bg)" />
    <rect x="12" y="19" width="40" height="26" rx="5" fill="#fff" />
    <path d="M13.5 21.5 L32 35 L50.5 21.5" fill="none" stroke="#a9cef0" strokeWidth="2.6" strokeLinejoin="round" />
  </Svg>
)

const Maps = () => (
  <Svg>
    <defs>
      <clipPath id="mp-clip">
        <rect x="3" y="3" width="58" height="58" rx="14" />
      </clipPath>
    </defs>
    <g clipPath="url(#mp-clip)">
      <rect x="3" y="3" width="58" height="58" fill="#f1ede3" />
      <path d="M3 38 L26 30 L46 40 L61 33 V61 H3 Z" fill="#bfe0a6" />
      <path d="M40 3 L61 3 L61 24 Z" fill="#a9d8ef" />
      <path d="M8 14 L30 24 L40 14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14 L30 24 L40 14" fill="none" stroke="#f4b43a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 22 c-6 0 -10 4 -10 10 c0 7.5 10 17 10 17 s10 -9.5 10 -17 c0 -6 -4 -10 -10 -10 Z" fill="#f5453a" />
      <circle cx="36" cy="32" r="3.6" fill="#fff" />
    </g>
  </Svg>
)

const PHOTO_PETALS = [
  ['#fb4b4b', 0],
  ['#ff9d2e', 45],
  ['#ffd23d', 90],
  ['#46cf6a', 135],
  ['#22bdbd', 180],
  ['#2d8bff', 225],
  ['#7a5cff', 270],
  ['#ff5bbd', 315],
]
const Photos = () => (
  <Svg>
    <defs>
      <linearGradient id="ph-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#eceef1" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#ph-bg)" />
    <g opacity="0.92">
      {PHOTO_PETALS.map(([c, a]) => (
        <ellipse key={a} cx="32" cy="19.5" rx="6.8" ry="12.5" fill={c} transform={`rotate(${a} 32 32)`} />
      ))}
    </g>
    <circle cx="32" cy="32" r="4.2" fill="#fff" />
  </Svg>
)

const Music = () => (
  <Svg>
    <defs>
      <linearGradient id="mu-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fc6a7f" />
        <stop offset="1" stopColor="#e3194b" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#mu-bg)" />
    <path d="M28 43 V20.5 L46 16.5 V38" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    <ellipse cx="24" cy="43" rx="5.6" ry="4.8" fill="#fff" />
    <ellipse cx="42" cy="38.2" rx="5.6" ry="4.8" fill="#fff" />
  </Svg>
)

const Calendar = () => (
  <Svg>
    <defs>
      <linearGradient id="cal-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#f0f1f4" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#cal-bg)" />
    <text x="32" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f5453a" fontFamily="-apple-system, Helvetica, Arial, sans-serif" letterSpacing="0.5">
      WED
    </text>
    <text x="32" y="51" textAnchor="middle" fontSize="29" fontWeight="500" fill="#2b2b2e" fontFamily="-apple-system, Helvetica, Arial, sans-serif">
      17
    </text>
  </Svg>
)

const Settings = () => (
  <Svg>
    <defs>
      <linearGradient id="set-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d3d8df" />
        <stop offset="1" stopColor="#8b929c" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#set-bg)" />
    <g fill="#fcfdff">
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="28" y="9" width="8" height="9" rx="2.5" transform={`rotate(${i * 45} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="15" />
    </g>
    <circle cx="32" cy="32" r="6.5" fill="#8b929c" />
  </Svg>
)

const Terminal = () => (
  <Svg>
    <defs>
      <linearGradient id="tm-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#454547" />
        <stop offset="1" stopColor="#1c1c1e" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#tm-bg)" />
    <rect x="3" y="3" width="58" height="13" rx="14" fill="#000" opacity="0.18" />
    <path d="M17 26 L26 33 L17 40" fill="none" stroke="#37d35f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M29 40 H42" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
  </Svg>
)

const Trash = () => (
  <Svg>
    <defs>
      <linearGradient id="tr-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f0f3f8" />
        <stop offset="1" stopColor="#d1d8e1" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#tr-bg)" />
    <path d="M18 24 H46" stroke="#7c8694" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M27 22.5 q5 -4 10 0" fill="none" stroke="#7c8694" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M22 26 H42 L40.2 47.5 A3.2 3.2 0 0 1 37 50.5 H27 A3.2 3.2 0 0 1 23.8 47.5 Z" fill="none" stroke="#7c8694" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M29 30 V46 M34.6 30 V46" stroke="#7c8694" strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

const Notes = () => (
  <Svg>
    <defs>
      <linearGradient id="nt-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff3b0" />
        <stop offset="1" stopColor="#ffd83d" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#nt-bg)" />
    <path d="M3 19 V17 A14 14 0 0 1 17 3 H47 A14 14 0 0 1 61 17 V19 Z" fill="#f4c23c" />
    <g stroke="#c79a2e" strokeWidth="2.6" strokeLinecap="round">
      <path d="M16 30 H48" />
      <path d="M16 38 H48" />
      <path d="M16 46 H40" />
    </g>
  </Svg>
)

const Calculator = () => (
  <Svg>
    <defs>
      <linearGradient id="calc-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3c3c3f" />
        <stop offset="1" stopColor="#1b1b1d" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="url(#calc-bg)" />
    <rect x="12" y="11" width="40" height="10" rx="2" fill="#0d0d0f" />
    <g fill="#6a6a6e">
      {[0, 1, 2].map((c) =>
        [0, 1, 2].map((r) => (
          <rect key={`${c}-${r}`} x={13 + c * 10} y={26 + r * 9} width="7" height="6" rx="1.5" />
        )),
      )}
    </g>
    <rect x="43" y="26" width="7" height="24" rx="2" fill="#ff9f0a" />
  </Svg>
)

// Apps shown in the Dock (Trash is rendered separately, after a divider).
export const DOCK_APPS = [
  { name: 'Finder', Icon: Finder },
  { name: 'Safari', Icon: Safari },
  { name: 'Messages', Icon: Messages },
  { name: 'Mail', Icon: Mail },
  { name: 'Maps', Icon: Maps },
  { name: 'Photos', Icon: Photos },
  { name: 'Music', Icon: Music },
  { name: 'Notes', Icon: Notes },
  { name: 'Calendar', Icon: Calendar },
  { name: 'Calculator', Icon: Calculator },
  { name: 'System Settings', Icon: Settings },
  { name: 'Terminal', Icon: Terminal },
]

export { Trash }
