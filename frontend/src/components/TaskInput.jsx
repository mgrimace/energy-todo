import React, { useState } from 'react'
import useTagInputController from '../hooks/useTagInputController'

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

  return (
    <form className="task-input" onSubmit={submit}>
      <div className="task-row">
        <label className="sr-only" htmlFor="task-title">New task</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="New task"
          disabled={disabled}
        />

        <label className="sr-only" htmlFor="task-energy">Task energy</label>
        <select
          id="task-energy"
          className={`task-energy-select energy-${energy}`}
          value={energy}
          onChange={event => setEnergy(event.target.value)}
          disabled={disabled}
        >
          <option value="low">Low Energy</option>
          <option value="medium">Medium Energy</option>
          <option value="high">High Energy</option>
        </select>

        <button type="submit" className="btn btn-primary" disabled={disabled || !title.trim()}>
          Save
        </button>
      </div>

      <div className="task-tags">
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
    </form>
  )
}
