import { useState } from 'react'

export default function ChecklistItem({ label }) {
  const [checked, setChecked] = useState(false)

  return (
    <label className={'checklist-item' + (checked ? ' checked' : '')}>
      <input type="checkbox" checked={checked} onChange={() => setChecked((v) => !v)} />
      <span className="checklist-box" aria-hidden="true" />
      <span className="checklist-label">{label}</span>
    </label>
  )
}
