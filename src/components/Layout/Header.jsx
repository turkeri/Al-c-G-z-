import { useNavigate } from 'react-router-dom'

export default function Header({ title, subtitle, showBack = false }) {
  const navigate = useNavigate()

  return (
    <header className="app-header">
      {showBack && (
        <button className="header-back" onClick={() => navigate(-1)} aria-label="Geri git">
          &#8592;
        </button>
      )}
      <div className="header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  )
}
