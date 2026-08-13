const PATHS = {
  car: (
    <>
      <path d="M4 16.5 5.4 11a2 2 0 0 1 1.9-1.4h9.4a2 2 0 0 1 1.9 1.4l1.4 5.5" />
      <rect x="3" y="16.5" width="18" height="4.5" rx="1.5" />
      <circle cx="7.5" cy="21" r="1.4" />
      <circle cx="16.5" cy="21" r="1.4" />
      <path d="M6 13h12" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 21 19H3L12 3.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
      <path d="m8.5 12.5 2 2 4-4.5" />
      <path d="M8.5 17h7" />
    </>
  ),
  heart: (
    <path d="M12 20.2c-4.7-3.2-8.5-6.4-8.5-10.4a4.8 4.8 0 0 1 8.5-3 4.8 4.8 0 0 1 8.5 3c0 4-3.8 7.2-8.5 10.4Z" />
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8" />
      <circle cx="8.3" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8.3" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8.3" cy="19" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.7" cy="19" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  note: (
    <>
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14.5 3v4.5H19" />
      <path d="M8 12.5h8M8 16h5" />
      <path d="m9.5 20 2 2 3.5-4" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.5V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.3-4.3" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a4 4 0 0 0-5.4 4.7L3 17.3 6.7 21l6.3-6.3a4 4 0 0 0 4.7-5.4l-3 3-2-2Z" />
  ),
  heartOutline: (
    <path d="M12 20.2c-4.7-3.2-8.5-6.4-8.5-10.4a4.8 4.8 0 0 1 8.5-3 4.8 4.8 0 0 1 8.5 3c0 4-3.8 7.2-8.5 10.4Z" />
  ),
  gauge: (
    <>
      <path d="M4.5 16.5a8.5 8.5 0 1 1 15 0" />
      <path d="M12 12 15 8" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  shield: (
    <path d="M12 3 5 5.5V11c0 5 3 8.5 7 10 4-1.5 7-5 7-10V5.5L12 3Z" />
  )
}

export default function Icon({ name, size = 24, strokeWidth = 1.8, className }) {
  const content = PATHS[name]
  if (!content) return null
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {content}
    </svg>
  )
}
