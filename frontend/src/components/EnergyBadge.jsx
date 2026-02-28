import React from 'react'
import { Leaf, Crosshair, Circle } from 'lucide-react'

const config = {
  low: { label: 'Quick Wins', Icon: Leaf },
  medium: { label: 'High Priority', Icon: Circle },
  high: { label: 'Deep Work', Icon: Crosshair }
}

export default function EnergyBadge({ energy, onClick, onPointerDown, onKeyDownCapture }) {
  const normalized = (energy || '').toLowerCase()
  const option = config[normalized] || { label: 'Energy Mode', Icon: Crosshair }
  const { label, Icon } = option
  const isInteractive = typeof onClick === 'function'

  if (isInteractive) {
    return (
      <button
        type="button"
        className={`energy-badge energy-${normalized}`}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onKeyDownCapture={onKeyDownCapture}
        aria-label={`Toggle energy level. Current: ${label}`}
      >
        <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <span className={`energy-badge energy-${normalized}`}>
      <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
