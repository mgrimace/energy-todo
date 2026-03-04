import React from 'react'

const TAB_CONFIG = [
  { key: 'all', label: 'All', tone: 'base' },
  { key: 'quick', label: 'Quick Wins', tone: 'low' },
	{ key: 'priority', label: 'Well Balanced', tone: 'medium' },
  { key: 'deep', label: 'Deep Work', tone: 'high' },
  { key: 'completed', label: 'Completed', tone: 'base' }
]

export default function FilterTabs({ filter, setFilter }) {
  const tabRefs = React.useRef([])
  const selectedIndex = React.useMemo(
    () => Math.max(0, TAB_CONFIG.findIndex(tab => tab.key === filter)),
    [filter]
  )
  const [focusIndex, setFocusIndex] = React.useState(selectedIndex)

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
    <div className="filter-pill">
      <div className="filter-pill-track" role="tablist" aria-label="Filter todos by energy state">
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
              <span className="filter-pill-chip">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
