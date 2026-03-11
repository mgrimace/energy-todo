import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { themes } from '../themes'
import { applyTheme } from '../themes/themeManager'

const MODE_STORAGE_KEY = 'todo_mode'
const THEME_STORAGE_KEY = 'todo_theme'
const DEFAULT_THEME_ID = 'default'
const ThemeContext = createContext(null)

const readStoredMode = () => {
  try {
    const value = window.localStorage.getItem(MODE_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const readStoredThemeId = () => {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return themes.some(theme => theme.id === value) ? value : null
  } catch {
    return null
  }
}

const getInitialMode = () => {
  const storedMode = readStoredMode()
  if (storedMode) return storedMode

  try {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode)
  const [themeId, setThemeId] = useState(() => readStoredThemeId() || DEFAULT_THEME_ID)

  useEffect(() => {
    const selectedTheme = themes.find(theme => theme.id === themeId) || themes[0]
    applyTheme(selectedTheme, mode)
    document.documentElement.classList.toggle('dark', mode === 'dark')

    const iconHref = mode === 'dark' ? '/icons/icon-dark.svg' : '/icons/icon-light.svg'
    const appIcon = document.getElementById('app-icon')
    const appleTouchIcon = document.getElementById('apple-touch-icon')
    if (appIcon) {
      appIcon.setAttribute('href', iconHref)
    }
    if (appleTouchIcon) {
      appleTouchIcon.setAttribute('href', iconHref)
    }

    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode)
      window.localStorage.setItem(THEME_STORAGE_KEY, selectedTheme.id)
    } catch {
      // ignore storage failures in private/restricted browsing modes
    }
  }, [mode, themeId])

  const value = useMemo(() => {
    const selectedTheme = themes.find(theme => theme.id === themeId) || themes[0]
    const toggleMode = () => setMode(prev => (prev === 'dark' ? 'light' : 'dark'))

    return {
      themes,
      mode,
      setMode,
      toggleMode,
      themeId,
      setThemeId,
      selectedTheme
    }
  }, [mode, themeId])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
