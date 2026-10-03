import React from 'react'
import { PaletteIcon } from '@phosphor-icons/react'

const STORAGE_KEY = 'energy-todo-tint-strength'
const MIN = -20
const MAX = 100
const DETENT = 6
const ENGAGE = 0.6
const RELEASE = 0.4
const ZERO_POSITION = -MIN / (MAX - MIN)

let hapticLabel = null

const haptic = duration => {
  if (!window.matchMedia('(pointer: coarse)').matches) return
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(duration)
    return
  }
  if (!hapticLabel) {
    hapticLabel = document.createElement('label')
    hapticLabel.setAttribute('aria-hidden', 'true')
    hapticLabel.style.display = 'none'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    hapticLabel.appendChild(input)
    document.head.appendChild(hapticLabel)
  }
  hapticLabel.click()
}

const normalize = value => {
  if (value < 0) return MIN
  if (value <= DETENT) return 0
  return Math.min(MAX, value)
}

const resolve = (raw, previous) => {
  if (raw >= 0) return raw <= DETENT ? 0 : raw
  const depth = raw / MIN
  if (previous === MIN) return depth > RELEASE ? MIN : 0
  return depth >= ENGAGE ? MIN : 0
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
  const root = document.documentElement
  root.style.setProperty('--tint-strength', `${Math.max(0, value)}%`)
  root.style.setProperty('--ui-dim', value === MIN ? '1' : '0')
}

const describe = value => {
  if (value === MIN) return 'Focus mode on'
  if (value === 0) return 'Header tint off'
  return `Header tint ${value}%`
}

export default function TintSlider() {
  const [value, setValue] = React.useState(() => readStored() ?? readCssDefault())
  const valueRef = React.useRef(value)

  React.useLayoutEffect(() => {
    const stored = readStored()
    if (stored !== null) applyValue(stored)
  }, [])

  const commit = next => {
    const previous = valueRef.current
    if (next === previous) return
    if (next === MIN || previous === MIN) haptic(18)
    else if (next === 0) haptic(8)
    valueRef.current = next
    setValue(next)
    applyValue(next)
    storeValue(next)
  }

  const handleChange = event => {
    commit(resolve(Number(event.target.value), valueRef.current))
  }

  const handleKeyDown = event => {
    const down = event.key === 'ArrowLeft' || event.key === 'ArrowDown'
    const up = event.key === 'ArrowRight' || event.key === 'ArrowUp'
    const current = valueRef.current

    if (down && current === 0) {
      event.preventDefault()
      commit(MIN)
    } else if (up && current === MIN) {
      event.preventDefault()
      commit(0)
    } else if (up && current === 0) {
      event.preventDefault()
      commit(DETENT + 1)
    }
  }

  const handleReset = () => {
    const root = document.documentElement
    root.style.removeProperty('--tint-strength')
    root.style.removeProperty('--ui-dim')
    clearStoredValue()
    const next = readCssDefault()
    valueRef.current = next
    setValue(next)
  }

  return (
    <label className="tint-slider-wrap" title="Header tint and focus mode (double-click to reset)">
      <span className="tint-slider-field" style={{ '--tint-slider-zero': ZERO_POSITION }}>
        <input
          type="range"
          className="tint-slider"
          min={MIN}
          max={MAX}
          step="1"
          value={value}
          data-focus={value === MIN ? 'on' : 'off'}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onDoubleClick={handleReset}
          aria-label="Header tint and focus mode"
          aria-valuetext={describe(value)}
        />
      </span>
      <PaletteIcon className="tint-slider-icon" weight="regular" aria-hidden="true" />
    </label>
  )
}