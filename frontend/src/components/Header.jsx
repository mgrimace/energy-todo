import React from 'react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="top-header">
      <h1>Energy Todo</h1>
      <ThemeToggle />
    </header>
  )
}
