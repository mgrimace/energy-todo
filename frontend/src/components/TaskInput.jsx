import React, { useState } from 'react'
import { PlusIcon } from '@phosphor-icons/react'
import EnergyBadge from './EnergyBadge'
import useTagInputController from '../hooks/useTagInputController'

const ENERGY_ORDER = ['low', 'medium', 'high']

export default function TaskInput({ onAdd, disabled }) {
  const [title, setTitle] = useState('')
  const [energy, setEnergy] = useState('low')
  const {
    tags,
    inputValue: tagInput,
    onInputChange: onTagInputChange,
    onKeyDown: onTagKeyDown,
    onPaste: onTagPaste,
    clear: clearTags,
    getSnapshot: getTagSnapshot
  } = useTagInputController()

  const submit = async (event) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const dedupedTags = getTagSnapshot()

    await onAdd(trimmedTitle, energy, dedupedTags)
    setTitle('')
    setEnergy('low')
    clearTags()
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

  return (
    <form className="task-input" data-energy={energy} onSubmit={submit}>
      <div className="task-title-row">
        <label className="sr-only" htmlFor="task-title">New task</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="New task"
          disabled={disabled}
        />
        <button
          type="submit"
          className="btn btn-primary task-save-btn"
          disabled={disabled || !title.trim()}
        >
          <PlusIcon size={14} aria-hidden="true" />
          Add
        </button>
      </div>

      <div className="task-meta-row">
        <EnergyBadge
          energy={energy}
          tooltip="Change energy cost"
          onClick={disabled ? undefined : cycleEnergy}
        />
        <div className="task-meta-tags">
          {tags.map(tag => (
            <span key={tag} className="tag-pill">{tag}</span>
          ))}
          <label className="sr-only" htmlFor="task-tag-input">Task tags</label>
          <input
            id="task-tag-input"
            type="text"
            value={tagInput}
            onChange={onTagInputChange}
            onKeyDown={onTagKeyDown}
            onPaste={onTagPaste}
            placeholder="Add tag (comma to create)"
            disabled={disabled}
          />
        </div>
      </div>
    </form>
  )
}
