import React, { useEffect, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

function ThemePreview({ colors }) {
  const [first, second, third] = colors || []

  return (
    <span
      className="theme-preview"
      aria-hidden="true"
      style={{
        '--preview-1': first,
        '--preview-2': second,
        '--preview-3': third
      }}
    >
      <span className="theme-preview-swatch" />
      <span className="theme-preview-swatch" />
      <span className="theme-preview-swatch" />
    </span>
  )
}

export default function ThemeSelector() {
  const { themes, selectedTheme, setThemeId } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])

  useEffect(() => {
    const selectedIndex = themes.findIndex(theme => theme.id === selectedTheme.id)
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex)
  }, [themes, selectedTheme.id])

  useEffect(() => {
    if (!isOpen) return undefined

    const option = optionRefs.current[activeIndex]
    option?.focus()

    return undefined
  }, [isOpen, activeIndex])

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className="theme-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(prev => {
            const nextOpen = !prev
            if (nextOpen) {
              const selectedIndex = themes.findIndex(theme => theme.id === selectedTheme.id)
              setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex)
            }
            return nextOpen
          })
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const selectedIndex = themes.findIndex(theme => theme.id === selectedTheme.id)
            setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex)
            setIsOpen(true)
          }
        }}
      >
        <span className="theme-selector-label">{selectedTheme.name}</span>
        <ThemePreview colors={selectedTheme.preview} />
      </button>

      {isOpen ? (
        <ul className="theme-selector-menu" role="listbox" aria-label="Choose theme">
          {themes.map((theme, index) => {
            const isSelected = theme.id === selectedTheme.id

            return (
              <li key={theme.id} role="option" aria-selected={isSelected}>
                <button
                  ref={element => {
                    optionRefs.current[index] = element
                  }}
                  type="button"
                  className={`theme-selector-option ${isSelected ? 'is-active' : ''}`}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => {
                    setThemeId(theme.id)
                    setIsOpen(false)
                    triggerRef.current?.focus()
                  }}
                  onKeyDown={event => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      setActiveIndex(prev => (prev + 1) % themes.length)
                    }

                    if (event.key === 'ArrowUp') {
                      event.preventDefault()
                      setActiveIndex(prev => (prev - 1 + themes.length) % themes.length)
                    }

                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setThemeId(theme.id)
                      setIsOpen(false)
                      triggerRef.current?.focus()
                    }

                    if (event.key === 'Escape') {
                      event.preventDefault()
                      setIsOpen(false)
                      triggerRef.current?.focus()
                    }
                  }}
                >
                  <span className="theme-selector-option-name">{theme.name}</span>
                  <ThemePreview colors={theme.preview} />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
