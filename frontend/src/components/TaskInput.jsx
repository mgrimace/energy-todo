import React, { useEffect, useRef, useState } from 'react'
import { CaretDownIcon, CaretRightIcon, CaretUpIcon } from '@phosphor-icons/react'

const ENERGY_ORDER = ['low', 'medium', 'high']

export default function TaskInput({ onAdd, disabled, syncedEnergy }) {
  const [title, setTitle] = useState('')
  const [energy, setEnergy] = useState('low')
  const [position, setPosition] = useState('top')

  useEffect(() => {
    if (syncedEnergy) setEnergy(syncedEnergy)
  }, [syncedEnergy])
  const [confirmedTags, setConfirmedTags] = useState([])
  const inputRef = useRef(null)

  const submit = async (event) => {
    event.preventDefault()
    // Defensively confirm any trailing #tag (e.g. + button click while mid-tag)
    const trailingMatch = title.match(/#(\w+)$/)
    const cleanTitle = trailingMatch
      ? title.slice(0, -trailingMatch[0].length).trim()
      : title.trim()
    const finalTags = trailingMatch
      ? [...confirmedTags, trailingMatch[1]]
      : confirmedTags

    if (!cleanTitle) return

    await onAdd(cleanTitle, energy, finalTags, position)
    setTitle('')
    setEnergy(syncedEnergy ?? energy)
    setConfirmedTags([])
    setPosition('top')
  }

  const cycleEnergy = (event) => {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const isLeft = event.clientX < rect.left + rect.width / 2
    const currentIndex = ENERGY_ORDER.indexOf(energy)
    const nextIndex = isLeft
      ? (currentIndex - 1 + ENERGY_ORDER.length) % ENERGY_ORDER.length
      : (currentIndex + 1) % ENERGY_ORDER.length
    setEnergy(ENERGY_ORDER[nextIndex])
  }

  const handleChange = (event) => {
    const newValue = event.target.value
    // Confirm #word when followed by , or space
    const match = newValue.match(/#(\w+)([, ])$/)
    if (match) {
      setConfirmedTags(prev => [...prev, match[1]])
      setTitle(newValue.slice(0, -match[0].length))
      return
    }
    setTitle(newValue)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const match = title.match(/#(\w+)$/)
      if (match) {
        // Mid-tag: confirm the tag, do not submit
        event.preventDefault()
        setConfirmedTags(prev => [...prev, match[1]])
        setTitle(prev => prev.slice(0, -match[0].length))
      }
      // else: let the form submit naturally
    }
  }

  const editTag = (tag) => {
    setConfirmedTags(prev => prev.filter(t => t !== tag))
    setTitle(prev => prev + ' #' + tag)
    setTimeout(() => {
      const input = inputRef.current
      if (input) {
        input.focus()
        input.setSelectionRange(input.value.length, input.value.length)
      }
    }, 0)
  }

  return (
    <form className="task-input" data-energy={energy} data-has-title={title.trim() ? 'true' : undefined} onSubmit={submit}>
      <span className="task-input-caret" aria-hidden="true">
        <CaretRightIcon size={16} weight="bold" />
      </span>

      <div className="task-title-row">
        <button
          type="button"
          className="task-energy-selector"
          onClick={disabled ? undefined : cycleEnergy}
          onPointerDown={e => e.preventDefault()}
          aria-label={`Energy: ${energy}. Click to cycle.`}
          disabled={disabled}
        >
          {energy} energy
        </button>
        <label className="sr-only" htmlFor="task-title">new task</label>
        <input
          ref={inputRef}
          id="task-title"
          type="text"
          value={title}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="new task"
          disabled={disabled}
        />
        <div className="task-actions">
          {confirmedTags.map(tag => (
            <button
              key={tag}
              type="button"
              className="cmd-tag-token task-inline-tag"
              onClick={() => editTag(tag)}
              aria-label={`Remove tag ${tag} and edit`}
            >
              #{tag}
            </button>
          ))}
          <div className="task-position-toggle" role="group" aria-label="New task placement">
            <div className="task-position-track">
              <button
                type="button"
                className={`task-position-tab${position === 'top' ? ' is-active' : ''}`}
                onClick={() => setPosition('top')}
                onPointerDown={e => e.preventDefault()}
                aria-pressed={position === 'top'}
                aria-label="Add to top of list (sooner)"
                title="Add to top of list (sooner)"
                disabled={disabled}
              >
                <span className="task-position-chip">
                  <CaretUpIcon className="task-position-icon" size={16} weight="bold" aria-hidden="true" />
                  <span className="task-position-label">sooner</span>
                </span>
              </button>
              <button
                type="button"
                className={`task-position-tab${position === 'bottom' ? ' is-active' : ''}`}
                onClick={() => setPosition('bottom')}
                onPointerDown={e => e.preventDefault()}
                aria-pressed={position === 'bottom'}
                aria-label="Add to bottom of list (later)"
                title="Add to bottom of list (later)"
                disabled={disabled}
              >
                <span className="task-position-chip">
                  <CaretDownIcon className="task-position-icon" size={16} weight="bold" aria-hidden="true" />
                  <span className="task-position-label">later</span>
                </span>
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="task-save-btn"
            disabled={disabled || !title.trim()}
            aria-label="Add task"
          >
            +
          </button>
        </div>
      </div>
    </form>
  )
}
