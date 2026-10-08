import React from 'react'
import { DropSimpleIcon, FireSimpleIcon } from '@phosphor-icons/react'

const STORAGE_KEY = 'energy-todo-focus-mode'

const readStored = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

const storeValue = focused => {
  try {
    window.localStorage.setItem(STORAGE_KEY, focused ? 'on' : 'off')
    return true
  } catch {
    return false
  }
}

export default function FocusToggle() {
  const [focused, setFocused] = React.useState(readStored)

  React.useLayoutEffect(() => {
    document.documentElement.style.setProperty('--ui-dim', focused ? '1' : '0')
    storeValue(focused)
  }, [focused])

  const Icon = focused ? FireSimpleIcon : DropSimpleIcon

  return (
    <div className="focus-toggle">
      <button
        type="button"
        className="icon-toggle"
        aria-pressed={focused}
        aria-label="Focus mode"
        title={`Focus mode: ${focused ? 'on' : 'off'}`}
        onClick={() => setFocused(previous => !previous)}
      >
        <Icon size={16} weight="regular" aria-hidden="true" />
      </button>
    </div>
  )
}