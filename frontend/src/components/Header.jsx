import React from 'react'
import ThemeSelector from './ThemeSelector'
import FocusToggle from './FocusToggle'
import TintSlider from './TintSlider'

export default function Header() {
  const iconSrc = '/icons/icon-dark-transparent.svg'

  return (
    <header className="top-header">
      <h1>
        <img className="top-header-icon" src={iconSrc} alt="" aria-hidden="true" />
        <span>Energy Todo</span>
      </h1>
      <div className="header-actions">
        <FocusToggle />
        <TintSlider />
        <ThemeSelector />
      </div>
    </header>
  )
}