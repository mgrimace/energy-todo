import React, { useEffect, useState } from 'react'
import { GripVertical } from 'lucide-react'
import EnergyBadge from './EnergyBadge'

export default function TodoCard({ todo, onToggle, onDelete, onEdit, dragHandleProps }) {
  const tags = Array.isArray(todo.tags) ? todo.tags : []
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(todo.title)

  useEffect(() => {
    if (!isEditing) setDraftTitle(todo.title)
  }, [todo.title, isEditing])

  const startEditing = () => {
    setDraftTitle(todo.title)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setDraftTitle(todo.title)
    setIsEditing(false)
  }

  const saveEditing = async () => {
    const trimmed = draftTitle.trim()
    if (!trimmed) {
      cancelEditing()
      return
    }

    if (trimmed === todo.title) {
      setIsEditing(false)
      return
    }

    try {
      await onEdit(trimmed)
      setIsEditing(false)
    } catch (error) {
      console.error('failed to update todo title', error)
    }
  }

  return (
    <article className={`card energy-${todo.energy} ${todo.completed ? 'is-complete' : ''}`} data-completed={todo.completed ? 'true' : 'false'}>
      <div className="card-left">
        {dragHandleProps ? (
          <button
            type="button"
            className="drag-handle"
            aria-label="Reorder task"
            {...dragHandleProps}
          >
            <GripVertical size={15} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : null}
        <button type="button" className="checkbox" onClick={onToggle} aria-pressed={todo.completed}>
          {todo.completed ? '✓' : ''}
        </button>
        <div className="card-body">
          {isEditing ? (
            <input
              type="text"
              className="title-input"
              value={draftTitle}
              onChange={event => setDraftTitle(event.target.value)}
              onBlur={saveEditing}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  saveEditing()
                }

                if (event.key === 'Escape') {
                  event.preventDefault()
                  cancelEditing()
                }
              }}
              aria-label="Edit task title"
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="title-button"
              onClick={startEditing}
              aria-label="Edit task title"
            >
              <span className="title">{todo.title}</span>
            </button>
          )}
          <div className="meta">
            <EnergyBadge energy={todo.energy} />
            {tags.length > 0 ? (
              <div className="card-tags" aria-label="Task tags">
                {tags.map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <button type="button" className="delete" onClick={onDelete} aria-label="Delete todo">Delete</button>
    </article>
  )
}
