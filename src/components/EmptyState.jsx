export default function EmptyState({ title, description, icon = 'search' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon === 'search' && (
          <svg viewBox="0 0 64 64" width="56" height="56">
            <circle cx="27" cy="27" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
            <line x1="39" y1="39" x2="54" y2="54" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          </svg>
        )}
        {icon === 'heart' && (
          <svg viewBox="0 0 64 64" width="56" height="56">
            <path
              d="M32 54 C14 42 6 32 6 21 C6 12 13 6 21 6 C27 6 31 9 32 14 C33 9 37 6 43 6 C51 6 58 12 58 21 C58 32 50 42 32 54 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {icon === 'clipboard' && (
          <svg viewBox="0 0 64 64" width="56" height="56">
            <rect x="14" y="10" width="36" height="46" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
            <rect x="24" y="6" width="16" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="4" />
            <line x1="22" y1="30" x2="42" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <line x1="22" y1="40" x2="42" y2="40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}
