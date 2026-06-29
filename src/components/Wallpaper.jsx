// A macOS Sequoia-style wallpaper: a dusk sky with a warm glow at the horizon and
// layered mountain ridges that recede with atmospheric haze. Drawn as SVG so it
// scales crisply and stays asset-free.
export default function Wallpaper() {
  return (
    <svg
      className="desktop__wallpaper"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f1846" />
          <stop offset="0.38" stopColor="#46285f" />
          <stop offset="0.62" stopColor="#7f3a6e" />
          <stop offset="0.8" stopColor="#bd5a68" />
          <stop offset="0.92" stopColor="#e7895f" />
          <stop offset="1" stopColor="#f4ad74" />
        </linearGradient>
        <radialGradient id="wp-sun" cx="0.5" cy="0.92" r="0.55">
          <stop offset="0" stopColor="#ffe7c0" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#ffcf9c" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffcf9c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wp-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7895f" stopOpacity="0" />
          <stop offset="1" stopColor="#f0a06e" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#wp-sky)" />
      <ellipse cx="720" cy="815" rx="560" ry="300" fill="url(#wp-sun)" />

      {/* Mountain ridges, back (hazy/light) to front (dark). */}
      <path
        d="M0 582 L180 520 L320 575 L470 505 L640 566 L780 500 L940 560 L1120 514 L1290 566 L1440 524 L1440 900 L0 900 Z"
        fill="#8e4a79"
        opacity="0.5"
      />
      <path
        d="M0 666 L220 606 L400 666 L560 600 L740 666 L930 610 L1130 670 L1320 614 L1440 650 L1440 900 L0 900 Z"
        fill="#6b386a"
        opacity="0.78"
      />
      <path
        d="M0 756 L260 700 L520 766 L780 694 L1040 760 L1300 704 L1440 740 L1440 900 L0 900 Z"
        fill="#4a2a57"
      />
      <path
        d="M0 842 L300 796 L640 854 L980 800 L1280 850 L1440 820 L1440 900 L0 900 Z"
        fill="#2c1b3c"
      />

      {/* Warm haze settling into the valleys. */}
      <rect x="0" y="560" width="1440" height="340" fill="url(#wp-haze)" />
    </svg>
  )
}
