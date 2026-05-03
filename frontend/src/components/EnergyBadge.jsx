import React from 'react'

const config = {
  low: { label: 'Low', listLabel: 'Quick win' },
  medium: { label: 'Medium', listLabel: 'Balanced' },
  high: { label: 'High', listLabel: 'Focused' }
}

export default function EnergyBadge({ energy, variant, tooltip, onClick, onPointerDown, onKeyDownCapture }) {
  const normalized = (energy || '').toLowerCase()
  const option = config[normalized] || { label: 'Energy', listLabel: 'Energy' }
  const label = variant === 'list' ? option.listLabel : option.label
  const title = tooltip ?? (variant === 'list' ? option.label : option.listLabel)
  const isInteractive = typeof onClick === 'function'

  if (isInteractive) {
    return (
      <button
        type="button"
        className={`energy-badge energy-${normalized}`}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onKeyDownCapture={onKeyDownCapture}
        title={title}
        aria-label={`Toggle energy level. Current: ${label}`}
      >
        <span>{label}</span>
      </button>
    )
  }

  return (
    <span className={`energy-badge energy-${normalized}`} title={title}>
      <span>{label}</span>
    </span>
  )
}
