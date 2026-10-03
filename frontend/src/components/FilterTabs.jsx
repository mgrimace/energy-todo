import React from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import useSearchShortcut from '../hooks/useSearchShortcut'

const TAB_CONFIG = [
  { key: 'all',       label: 'All',     tone: 'base' },
  { key: 'quick',     label: 'Low',     tone: 'low' },
  { key: 'priority',  label: 'Medium',  shortLabel: 'Med', tone: 'medium' },
  { key: 'deep',      label: 'High',    tone: 'high' },
  { key: 'completed', label: 'Done',    tone: 'base' },
]

export default function FilterTabs({ filter, setFilter, search, onSearchChange }) {
  const tabRefs = React.useRef([])
  const searchInputRef = React.useRef(null)
  const trackRef = React.useRef(null)
  const selectedIndex = React.useMemo(
    () => Math.max(0, TAB_CONFIG.findIndex(tab => tab.key === filter)),
    [filter]
  )
  const [focusIndex, setFocusIndex] = React.useState(selectedIndex)
  const activeTab = TAB_CONFIG[selectedIndex]

  useSearchShortcut(searchInputRef)

  React.useEffect(() => {
    const root = document.documentElement
    root.dataset.energyFilter = activeTab.tone
    root.dataset.filterKey = activeTab.key
    return () => {
      delete root.dataset.energyFilter
      delete root.dataset.filterKey
    }
  }, [activeTab.tone, activeTab.key])

  React.useLayoutEffect(() => {
    const root = document.documentElement
    const track = trackRef.current
    if (!track) return undefined

    const syncTintHeight = () => {
      const bottom = track.getBoundingClientRect().bottom + window.scrollY
      root.style.setProperty('--page-tint-height', `${Math.round(bottom)}px`)
    }

    syncTintHeight()
    const observer = new ResizeObserver(syncTintHeight)
    observer.observe(document.body)
    observer.observe(track)
    window.addEventListener('resize', syncTintHeight)
    document.fonts?.ready.then(syncTintHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncTintHeight)
      root.style.removeProperty('--page-tint-height')
    }
  }, [])

  React.useEffect(() => {
    setFocusIndex(selectedIndex)
  }, [selectedIndex])

  const focusTabByIndex = index => {
    tabRefs.current[index]?.focus()
    setFocusIndex(index)
  }

  const handleTabKeyDown = (event, index, key) => {
    const lastIndex = TAB_CONFIG.length - 1

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusTabByIndex(index > 0 ? index - 1 : 0)
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusTabByIndex(index < lastIndex ? index + 1 : lastIndex)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusTabByIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusTabByIndex(lastIndex)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setFilter(key)
    }
  }

  return (
    <div className="filter-row">
      <div ref={trackRef} className="filter-pill-track">
        <div className="filter-pill" role="tablist" aria-label="Filter todos by energy state">
          {TAB_CONFIG.map((tab, index) => {
            const isActive = filter === tab.key
            return (
              <button
                type="button"
                key={tab.key}
                role="tab"
                ref={element => {
                  tabRefs.current[index] = element
                }}
                className={`filter-pill-button ${isActive ? 'is-active' : ''}`}
                data-filter-key={tab.key}
                data-filter-tone={tab.tone}
                aria-selected={isActive}
                tabIndex={focusIndex === index ? 0 : -1}
                onFocus={() => setFocusIndex(index)}
                onKeyDown={event => handleTabKeyDown(event, index, tab.key)}
                onClick={() => setFilter(tab.key)}
              >
                <span className="filter-pill-chip">
                  {tab.shortLabel ? (
                    <>
                      <span className="filter-pill-label-full">{tab.label}</span>
                      <span className="filter-pill-label-short">{tab.shortLabel}</span>
                    </>
                  ) : (
                    <span>{tab.label}</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <label className="search" htmlFor="task-search" data-has-value={search ? 'true' : undefined}>
          <span className="search-chip">
            <MagnifyingGlassIcon className="search-icon" weight="regular" aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="task-search"
              type="search"
              aria-label="Search tasks"
              value={search}
              onChange={event => onSearchChange(event.target.value)}
              placeholder="Search"
            />
          </span>
        </label>
      </div>
    </div>
  )
}