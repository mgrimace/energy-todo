import React from 'react'
import { LeafIcon, CircleIcon, FlowerLotusIcon } from '@phosphor-icons/react'

const config = {
  low: { label: 'Low', listLabel: 'Quick win', Icon: LeafIcon },
  medium: { label: 'Medium', listLabel: 'Well balanced', Icon: CircleIcon },
  high: { label: 'High', listLabel: 'Deep focus', Icon: FlowerLotusIcon }
}

export default function EnergyBadge({ energy, variant, tooltip, onClick, onPointerDown, onKeyDownCapture }) {
  const normalized = (energy || '').toLowerCase()
  const option = config[normalized] || { label: 'Energy', listLabel: 'Energy', Icon: FlowerLotusIcon }
  const { Icon } = option
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
        <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <span className={`energy-badge energy-${normalized}`} title={title}>
      <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
