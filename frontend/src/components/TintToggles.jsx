import React from 'react'
import { RowsIcon, TabsIcon } from '@phosphor-icons/react'

const STORAGE_KEY = 'energy-todo-tint-targets'

const TARGETS = [
  { key: 'header', label: 'Header tint', Icon: TabsIcon },
  { key: 'list', label: 'List tint', Icon: RowsIcon },
]

const readStored = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    return { header: parsed?.header !== false, list: parsed?.list !== false }
  } catch {
    return { header: true, list: true }
  }
}

const storeValue = value => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export default function TintToggles() {
  const [enabled, setEnabled] = React.useState(readStored)

  React.useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.tintHeader = enabled.header ? 'on' : 'off'
    root.dataset.tintList = enabled.list ? 'on' : 'off'
    storeValue(enabled)
  }, [enabled])

  const toggle = key => setEnabled(previous => ({ ...previous, [key]: !previous[key] }))

  return (
    <div className="tint-toggles" role="group" aria-label="Tint">
      <span className="tint-toggles-label">Tint Toggles:</span>
      {TARGETS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          className="icon-toggle"
          aria-pressed={enabled[key]}
          aria-label={label}
          title={`${label}: ${enabled[key] ? 'on' : 'off'}`}
          onClick={() => toggle(key)}
        >
          <Icon size={16} weight="regular" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}