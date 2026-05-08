import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme()

  return (
    <button
      className="btn-icon theme-toggle"
      onClick={toggleMode}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {mode === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  )
}