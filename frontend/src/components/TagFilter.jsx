import React from 'react'
import { FunnelIcon } from '@phosphor-icons/react'

const MAX_COLLAPSED = 5

// Does a todo pass the energy tab? Mirrors App's matchesEnergyFilter.
const ENERGY_FOR_FILTER = { quick: 'low', priority: 'medium', deep: 'high' }
export const matchesEnergy = (todo, filter) =>
  !ENERGY_FOR_FILTER[filter] || todo.energy === ENERGY_FOR_FILTER[filter]

export default function TagFilter({ todos, filter, tag, setTag }) {
  const [expanded, setExpanded] = React.useState(false)

  // Order is global (stable while switching energy tabs); counts are
  // contextual (what you'd actually get if you picked that tag now).
  const stats = React.useMemo(() => {
    const total = new Map()
    const inView = new Map()
    for (const todo of todos) {
      const inEnergy = matchesEnergy(todo, filter)
      for (const raw of Array.isArray(todo.tags) ? todo.tags : []) {
        const key = String(raw).toLowerCase()
        total.set(key, (total.get(key) ?? 0) + 1)
        if (inEnergy) inView.set(key, (inView.get(key) ?? 0) + 1)
      }
    }
    return [...total.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([key]) => ({ key, count: inView.get(key) ?? 0 }))
  }, [todos, filter])

  // Drop a selection whose tag no longer exists anywhere.
  React.useEffect(() => {
    if (tag && !stats.some(s => s.key === tag)) setTag(null)
  }, [stats, tag, setTag])

  if (stats.length === 0) return null

  // Funnel icon and TAGS label double as "clear": only interactive while a tag is selected.
  const ClearEl = tag ? 'button' : 'span'
  const clearProps = tag
    ? { type: 'button', onClick: () => setTag(null), 'aria-label': `Clear tag filter #${tag}` }
    : { 'aria-hidden': 'true' }

  const hiddenCount = Math.max(0, stats.length - MAX_COLLAPSED)

  return (
    <div className="filter-row tag-filter" data-expanded={expanded ? 'true' : undefined}>
      <ClearEl className="tag-filter-icon" {...clearProps}>
        <FunnelIcon size="1em" weight="regular" aria-hidden="true" />
      </ClearEl>
      <div className="tag-filter-list" role="group" aria-label="Filter todos by tag">
        <ClearEl className="tag-filter-label" {...clearProps}>Tags</ClearEl>
        {stats.map((s, index) => {
          const isActive = tag === s.key
          // The selected tag is never hidden behind "more".
          const isOverflow = index >= MAX_COLLAPSED && !isActive
          return (
            <button
              key={s.key}
              type="button"
              className={`tag-filter-chip${isActive ? ' is-active' : ''}`}
              data-overflow={isOverflow ? 'true' : undefined}
              data-empty={s.count === 0 ? 'true' : undefined}
              aria-pressed={isActive}
              onClick={() => setTag(isActive ? null : s.key)}
            >
              <span className="tag-filter-name">#{s.key}</span>
              <span className="tag-filter-count">{s.count}</span>
            </button>
          )
        })}
        {hiddenCount > 0 ? (
          <button
            type="button"
            className="tag-filter-more"
            aria-expanded={expanded}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'less' : `+${hiddenCount}`}
          </button>
        ) : null}
      </div>
    </div>
  )
}