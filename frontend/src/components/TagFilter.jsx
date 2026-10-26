import React from 'react'
import { FunnelIcon } from '@phosphor-icons/react'

const MAX_COLLAPSED = 3
const DOUBLE_TAP_MS = 300

// Does a todo pass the energy tab? Mirrors App's matchesEnergyFilter.
const ENERGY_FOR_FILTER = { quick: 'low', priority: 'medium', deep: 'high' }
export const matchesEnergy = (todo, filter) =>
  !ENERGY_FOR_FILTER[filter] || todo.energy === ENERGY_FOR_FILTER[filter]

// Tag filter = one mode + a set of tags. 'show': only todos with at least one of the tags.
// 'hide': everything except todos with any of the tags. No tags = no filtering.
export const EMPTY_TAG_FILTER = { mode: 'show', keys: [] }

export const matchesTagFilter = (todo, { mode, keys }) => {
  if (keys.length === 0) return true
  const tags = new Set((Array.isArray(todo.tags) ? todo.tags : []).map(t => String(t).toLowerCase()))
  const hit = keys.some(key => tags.has(key))
  return mode === 'hide' ? !hit : hit
}

const toggleKey = (filter, key) => {
  const keys = filter.keys.includes(key) ? filter.keys.filter(k => k !== key) : [...filter.keys, key]
  return keys.length > 0 ? { ...filter, keys } : EMPTY_TAG_FILTER
}

export default function TagFilter({ todos, filter, tagFilter, setTagFilter }) {
  const [expanded, setExpanded] = React.useState(false)
  const lastTapRef = React.useRef(null)

  // Order is global (stable while switching energy tabs); counts are
  // contextual (what you'd actually get if you picked that tag now).
  const stats = React.useMemo(() => {
    const total = new Map()
    const inView = new Map()
    for (const todo of todos) {
      // Counts show open tasks only (completed ones still filter/show in the list).
      // On the Done tab the list is all completed, so count those there instead.
      const counted = matchesEnergy(todo, filter) && (filter === 'completed' ? todo.completed : !todo.completed)
      for (const raw of Array.isArray(todo.tags) ? todo.tags : []) {
        const key = String(raw).toLowerCase()
        total.set(key, (total.get(key) ?? 0) + 1)
        if (counted) inView.set(key, (inView.get(key) ?? 0) + 1)
      }
    }
    return [...total.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([key]) => ({ key, count: inView.get(key) ?? 0 }))
  }, [todos, filter])

  // Drop selected tags that no longer exist anywhere.
  React.useEffect(() => {
    setTagFilter(prev => {
      const keys = prev.keys.filter(key => stats.some(s => s.key === key))
      if (keys.length === prev.keys.length) return prev
      return keys.length > 0 ? { ...prev, keys } : EMPTY_TAG_FILTER
    })
  }, [stats, setTagFilter])

  if (stats.length === 0) return null

  const { mode, keys } = tagFilter
  const hasFilter = keys.length > 0
  const hiding = mode === 'hide'

  // Tap toggles a tag in the current mode. A quick second tap on a tag that was just turned on from a
  // clean state converts it to "hide"; Shift+click / Shift+Enter does the same from the keyboard.
  const handleTag = (key, event) => {
    const now = performance.now()
    const last = lastTapRef.current
    const clean = keys.length === 0

    // Second tap on the lone tag the first tap just turned on (from a clean state), within the window.
    const doubleTapped =
      last && last.key === key && last.fromClean && now - last.time < DOUBLE_TAP_MS &&
      mode === 'show' && keys.length === 1 && keys[0] === key

    if ((clean && event.shiftKey) || doubleTapped) {
      lastTapRef.current = null
      setTagFilter({ mode: 'hide', keys: [key] })
      return
    }

    lastTapRef.current = { key, time: now, fromClean: clean }
    setTagFilter(prev => toggleKey(prev, key))
  }

  const switchMode = () => setTagFilter(prev => ({ ...prev, mode: prev.mode === 'hide' ? 'show' : 'hide' }))
  const reset = () => setTagFilter(EMPTY_TAG_FILTER)

  // Funnel resets everything; the label shows the mode and flips it. Both are static until a tag is set.
  const IconEl = hasFilter ? 'button' : 'span'
  const iconProps = hasFilter
    ? { type: 'button', onClick: reset, 'aria-label': 'Reset tag filters' }
    : { 'aria-hidden': 'true' }
  const LabelEl = hasFilter ? 'button' : 'span'
  const labelProps = hasFilter
    ? {
        type: 'button',
        onClick: switchMode,
        'aria-label': hiding
          ? 'Hiding the selected tags. Tap to show only them instead.'
          : 'Showing only the selected tags. Tap to hide them instead.',
      }
    : { 'aria-hidden': 'true' }
  const labelText = !hasFilter ? 'Tags' : hiding ? 'Hiding' : 'Showing'

  const hiddenCount = Math.max(0, stats.length - MAX_COLLAPSED)

  return (
    <div
      className="filter-row tag-filter"
      data-mode={hasFilter ? mode : undefined}
      data-expanded={expanded ? 'true' : undefined}
    >
      <IconEl className="tag-filter-icon" {...iconProps}>
        <FunnelIcon size="1em" weight="regular" aria-hidden="true" />
      </IconEl>
      <div className="tag-filter-main">
        <LabelEl className="tag-filter-label" {...labelProps}>{labelText}</LabelEl>
        <div className="tag-filter-list" role="group" aria-label="Filter todos by tag">
          {stats.map((s, index) => {
            const selected = keys.includes(s.key)
            // Selected tags are never tucked behind "+N".
            const isOverflow = index >= MAX_COLLAPSED && !selected
            const action = selected ? 'remove' : hiding ? 'hide' : 'show only'
            return (
              <button
                key={s.key}
                type="button"
                className="tag-filter-chip"
                data-state={selected ? (hiding ? 'hidden' : 'active') : undefined}
                data-overflow={isOverflow ? 'true' : undefined}
                data-empty={s.count === 0 ? 'true' : undefined}
                aria-pressed={selected}
                aria-label={`#${s.key}, ${s.count} open${selected ? (hiding ? ', hidden' : ', shown') : ''}. Tap to ${action}.`}
                title={hasFilter ? undefined : 'Tap to show only this tag; double-tap to hide it'}
                onClick={event => handleTag(s.key, event)}
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
    </div>
  )
}