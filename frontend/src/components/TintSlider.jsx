import React from 'react'
import { PaletteIcon } from '@phosphor-icons/react'

const STORAGE_KEY = 'energy-todo-tint-strength'
const MIN = 0
const MAX = 100
const SNAP = 4

const normalize = value => {
  if (value <= SNAP) return 0
  return Math.min(MAX, value)
}

const readStored = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? normalize(value) : null
  } catch {
    return null
  }
}

const storeValue = value => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value))
    return true
  } catch {
    return false
  }
}

const clearStoredValue = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

const readCssDefault = () =>
  Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tint-strength'))) || 0

const applyValue = value => {
  document.documentElement.style.setProperty('--tint-strength', `${value}%`)
}

const describe = value => (value === 0 ? 'Tint off' : `Tint ${value}%`)

export default function TintSlider() {
  const [value, setValue] = React.useState(() => readStored() ?? readCssDefault())
  const valueRef = React.useRef(value)

  React.useLayoutEffect(() => {
    const stored = readStored()
    if (stored !== null) applyValue(stored)
  }, [])

  const commit = next => {
    if (next === valueRef.current) return
    valueRef.current = next
    setValue(next)
    applyValue(next)
    storeValue(next)
  }

  const handleChange = event => {
    commit(normalize(Number(event.target.value)))
  }

  const handleKeyDown = event => {
    const up = event.key === 'ArrowRight' || event.key === 'ArrowUp'
    if (up && valueRef.current === 0) {
      event.preventDefault()
      commit(SNAP + 1)
    }
  }

  const handleReset = () => {
    document.documentElement.style.removeProperty('--tint-strength')
    clearStoredValue()
    const next = readCssDefault()
    valueRef.current = next
    setValue(next)
  }

  return (
    <label className="tint-slider-wrap" title="Tint strength (double-click to reset)">
      <span className="tint-slider-field">
        <input
          type="range"
          className="tint-slider"
          min={MIN}
          max={MAX}
          step="1"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onDoubleClick={handleReset}
          aria-label="Tint strength"
          aria-valuetext={describe(value)}
        />
      </span>
      <PaletteIcon className="tint-slider-icon" weight="regular" aria-hidden="true" />
    </label>
  )
}