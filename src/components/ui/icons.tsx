// Small hand-drawn icon set (stroke-based, 24x24) used across the landing
// page and app shell, so the UI doesn't rely on emoji rendering differently
// across operating systems.

type IconProps = { className?: string }

const base = {
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 1.75,
  stroke: 'currentColor',
} as const

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v3M17.25 3v3M3.75 8.25h16.5M5.25 5.25h13.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-12a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h2.25M7.5 15.75h2.25m4.5-3.75h2.25m-2.25 3.75h2.25" />
    </svg>
  )
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.25c0 4.28-4.03 7.75-9 7.75-1.02 0-2-.15-2.91-.42L4.5 20l1.06-3.18A7.93 7.93 0 0 1 3 11.25C3 6.97 7.03 3.5 12 3.5s9 3.47 9 7.75Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 11.25h7.5m-7.5 3h4.5" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 1.75" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path strokeLinecap="round" d="M3.75 19c0-2.9 2.35-5.25 5.25-5.25S14.25 16.1 14.25 19" />
      <path strokeLinecap="round" d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 19c0-2.4-1.4-4.45-3.4-5.1" />
    </svg>
  )
}

export function CreditCardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3.75a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
      <path strokeLinecap="round" d="M2.75 10.5h18.5M6 15h3" />
    </svg>
  )
}
