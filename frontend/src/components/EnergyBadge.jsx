import React from 'react'
import { Leaf, Crosshair, Circle } from 'lucide-react'

const config = {
  low: { label: 'Quick Wins', Icon: Leaf },
  medium: { label: 'Steady Focus', Icon: Circle },
  high: { label: 'Deep Focus', Icon: Crosshair }
}

export default function EnergyBadge({ energy }) {
  const normalized = (energy || '').toLowerCase()
  const option = config[normalized] || { label: 'Energy', Icon: Crosshair }
  const { label, Icon } = option

  return (
    <span className={`energy-badge energy-${normalized}`}>
      <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
