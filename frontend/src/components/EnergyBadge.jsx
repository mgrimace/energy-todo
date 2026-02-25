import React from 'react'

const labels = {
  low: 'Low energy',
  medium: 'Medium energy',
  high: 'High energy'
}

export default function EnergyBadge({ energy }) {
  const normalized = (energy || '').toLowerCase()
  const label = labels[normalized] || 'Unknown energy'

  return (
    <span className={`energy-badge energy-${normalized}`}>{label}</span>
  )
}
