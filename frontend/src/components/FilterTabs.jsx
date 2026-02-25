import React from 'react'

export default function FilterTabs({ filter, setFilter }) {
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'quick', label: 'Quick Wins' },
    { key: 'deep', label: 'Deep Focus' },
    { key: 'completed', label: 'Completed' }
  ]
  return (
    <div className="tabs" role="tablist">
      {tabs.map(t => (
        <button
          type="button"
          key={t.key}
          role="tab"
          className={"tab " + (filter === t.key ? 'active' : '')}
          aria-selected={filter === t.key}
          onClick={() => setFilter(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
