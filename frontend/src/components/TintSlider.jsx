import React from 'react'
import { PaletteIcon } from '@phosphor-icons/react'

const STORAGE_KEY = 'energy-todo-tint-strength'

const readStored = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null
  } catch {
    return null
  }
}

// The stylesheet (or the active theme) decides the starting strength; the slider only overrides it
const readCssDefault = () =>
  Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tint-strength'))) || 0

const applyStrength = value => {
  document.documentElement.style.setProperty('--tint-strength', `${value}%`)
}

export default function TintSlider() {
  const [value, setValue] = React.useState(() => readStored() ?? readCssDefault())

  // Restore a saved choice before first paint so the tint doesn't flash from the default
  React.useLayoutEffect(() => {
    const stored = readStored()
    if (stored !== null) applyStrength(stored)
  }, [])

  const handleChange = event => {
    const next = Number(event.target.value)
    setValue(next)
    applyStrength(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      // Storage unavailable (private mode, etc.): the slider still works for this session
    }
  }

  // Double-click returns to the stylesheet/theme default
  const handleReset = () => {
    document.documentElement.style.removeProperty('--tint-strength')
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setValue(readCssDefault())
  }

  return (
    <label className="tint-slider-wrap" title="Header tint (double-click to reset)">
      <PaletteIcon className="tint-slider-icon" weight="regular" aria-hidden="true" />
      <input
        type="range"
        className="tint-slider"
        min="0"
        max="100"
        step="1"
        value={value}
        onChange={handleChange}
        onDoubleClick={handleReset}
        aria-label="Header tint strength"
        aria-valuetext={`${value}%`}
      />
    </label>
  )
}