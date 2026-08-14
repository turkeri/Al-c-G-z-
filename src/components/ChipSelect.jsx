/**
 * Dokunmatik ekranda yazmaktan hızlı olan seçenek şeridi.
 * Kilometre bandı, kullanım amacı gibi kısa listeli alanlarda kullanılır.
 */
export default function ChipSelect({ options, value, onChange, ariaLabel }) {
  return (
    <div className="chip-select" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={'chip' + (option.id === value ? ' chip-active' : '')}
          onClick={() => onChange(option.id)}
          aria-pressed={option.id === value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
