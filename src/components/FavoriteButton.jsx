export default function FavoriteButton({ active, onToggle }) {
  return (
    <button
      type="button"
      className={'favorite-button' + (active ? ' active' : '')}
      onClick={onToggle}
      aria-pressed={active}
    >
      {active ? 'Favorilerde' : 'Favorilere Ekle'}
    </button>
  )
}
