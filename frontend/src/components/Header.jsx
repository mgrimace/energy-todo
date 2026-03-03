import React from 'react'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const { theme } = useTheme()
  const iconSrc = theme === 'dark' ? '/icons/icon-dark.svg' : '/icons/icon-light.svg'

  return (
    <header className="top-header">
      <h1>
        <img className="top-header-icon" src={iconSrc} alt="" aria-hidden="true" />
        <span>Energy Todo</span>
      </h1>
      <ThemeToggle />
    </header>
  )
}
