// macOS-style SVG wallpapers: a dusk sky with a horizon glow and layered mountain
// ridges. Several color variants are selectable from Control Center. Asset-free.
export const WALLPAPERS = ['dusk', 'night', 'aurora', 'graphite']

const PALETTES = {
  dusk: {
    sky: ['#1f1846', '#46285f', '#7f3a6e', '#bd5a68', '#e7895f', '#f4ad74'],
    sun: ['#ffe7c0', '#ffcf9c'],
    hazeTo: '#f0a06e',
    ridges: ['#8e4a79', '#6b386a', '#4a2a57', '#2c1b3c'],
  },
  night: {
    sky: ['#05060f', '#0b1330', '#162a4d', '#243b63', '#33506f', '#46688a'],
    sun: ['#9fc0e0', '#6f93bd'],
    hazeTo: '#2b3b58',
    ridges: ['#2f4566', '#243750', '#1a2840', '#10182c'],
  },
  aurora: {
    sky: ['#04121a', '#06303a', '#0c5a55', '#1f8f6e', '#3fbf86', '#86e0a8'],
    sun: ['#bdf7d8', '#7fe0b0'],
    hazeTo: '#2aa07a',
    ridges: ['#1f6e5a', '#155046', '#0e3a34', '#07221f'],
  },
  graphite: {
    sky: ['#1a1b1f', '#26282d', '#34373d', '#45494f', '#585d64', '#6e747c'],
    sun: ['#cdd2d8', '#9aa0a8'],
    hazeTo: '#5a5f66',
    ridges: ['#4a4e55', '#3a3d43', '#2a2c31', '#191a1d'],
  },
}

export default function Wallpaper({ variant = 'dusk' }) {
  const p = PALETTES[variant] || PALETTES.dusk
  const [s0, s1, s2, s3, s4, s5] = p.sky
  return (
    <svg
      className="desktop__wallpaper"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s0} />
          <stop offset="0.38" stopColor={s1} />
          <stop offset="0.62" stopColor={s2} />
          <stop offset="0.8" stopColor={s3} />
          <stop offset="0.92" stopColor={s4} />
          <stop offset="1" stopColor={s5} />
        </linearGradient>
        <radialGradient id="wp-sun" cx="0.5" cy="0.92" r="0.55">
          <stop offset="0" stopColor={p.sun[0]} stopOpacity="0.85" />
          <stop offset="0.5" stopColor={p.sun[1]} stopOpacity="0.35" />
          <stop offset="1" stopColor={p.sun[1]} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wp-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.hazeTo} stopOpacity="0" />
          <stop offset="1" stopColor={p.hazeTo} stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#wp-sky)" />
      <ellipse cx="720" cy="815" rx="560" ry="300" fill="url(#wp-sun)" />

      <path
        d="M0 582 L180 520 L320 575 L470 505 L640 566 L780 500 L940 560 L1120 514 L1290 566 L1440 524 L1440 900 L0 900 Z"
        fill={p.ridges[0]}
        opacity="0.5"
      />
      <path
        d="M0 666 L220 606 L400 666 L560 600 L740 666 L930 610 L1130 670 L1320 614 L1440 650 L1440 900 L0 900 Z"
        fill={p.ridges[1]}
        opacity="0.78"
      />
      <path
        d="M0 756 L260 700 L520 766 L780 694 L1040 760 L1300 704 L1440 740 L1440 900 L0 900 Z"
        fill={p.ridges[2]}
      />
      <path
        d="M0 842 L300 796 L640 854 L980 800 L1280 850 L1440 820 L1440 900 L0 900 Z"
        fill={p.ridges[3]}
      />

      <rect x="0" y="560" width="1440" height="340" fill="url(#wp-haze)" />
    </svg>
  )
}
