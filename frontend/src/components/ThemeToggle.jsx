import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  const isDark = mode === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleMode}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-label">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  )
}
