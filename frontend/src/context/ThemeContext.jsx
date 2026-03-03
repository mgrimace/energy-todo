import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'energy-todo-theme'
const ThemeContext = createContext(null)

const readStoredTheme = () => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const getInitialTheme = () => {
  const storedTheme = readStoredTheme()
  if (storedTheme) return storedTheme

  try {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.setAttribute('data-theme', theme)

    const iconHref = theme === 'dark' ? '/icons/icon-dark.svg' : '/icons/icon-light.svg'
    const appIcon = document.getElementById('app-icon')
    const appleTouchIcon = document.getElementById('apple-touch-icon')
    if (appIcon) {
      appIcon.setAttribute('href', iconHref)
    }
    if (appleTouchIcon) {
      appleTouchIcon.setAttribute('href', iconHref)
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore storage failures in private/restricted browsing modes
    }
  }, [theme])

  const value = useMemo(() => {
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    return { theme, toggleTheme, setTheme }
  }, [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
