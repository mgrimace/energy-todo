import React from 'react'

const TAB_CONFIG = [
  { key: 'all', label: 'All', tone: 'base' },
  { key: 'quick', label: 'Quick Wins', tone: 'low' },
  { key: 'priority', label: 'High Priority', tone: 'medium' },
  { key: 'deep', label: 'Deep Work', tone: 'high' },
  { key: 'completed', label: 'Completed', tone: 'complete' }
]

export default function FilterTabs({ filter, setFilter }) {
  return (
    <div className="filter-pill">
      <div className="filter-pill-track" role="tablist" aria-label="Filter todos by energy state">
        {TAB_CONFIG.map(tab => {
          const isActive = filter === tab.key
          return (
            <button
              type="button"
              key={tab.key}
              role="tab"
              className={`filter-pill-button ${isActive ? 'is-active' : ''}`}
              data-filter-key={tab.key}
              data-filter-tone={tab.tone}
              aria-selected={isActive}
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
