import React, { useState } from 'react'

export default function TaskInput({ onAdd, disabled }) {
  const [title, setTitle] = useState('')
  const [energy, setEnergy] = useState('low')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])

  const addTag = (value) => {
    const nextTag = value.trim().replace(/,+$/g, '')
    if (!nextTag) return

    setTags(prev => {
      if (prev.some(tag => tag.toLowerCase() === nextTag.toLowerCase())) return prev
      return [...prev, nextTag]
    })
  }

  const onTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(tagInput)
      setTagInput('')
      return
    }

    if (event.key === 'Backspace' && tagInput.length === 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const finalTags = tagInput.trim() ? [...tags, tagInput.trim()] : tags
    const dedupedTags = finalTags.filter((tag, index, all) => {
      const normalized = tag.toLowerCase()
      return all.findIndex(candidate => candidate.toLowerCase() === normalized) === index
    })

    await onAdd(trimmedTitle, energy, dedupedTags)
    setTitle('')
    setEnergy('low')
    setTagInput('')
    setTags([])
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
          <option value="low">Low energy</option>
          <option value="high">High energy</option>
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
          onChange={event => setTagInput(event.target.value)}
          onKeyDown={onTagKeyDown}
          placeholder="Add tag (comma to create)"
          disabled={disabled}
        />
      </div>
    </form>
  )
}
