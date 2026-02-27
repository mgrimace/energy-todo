import React, { useEffect, useState } from 'react'
import EnergyBadge from './EnergyBadge'

const parseTags = (value) => {
  const seen = new Set()
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const normalized = tag.toLowerCase()
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
}

export default function TodoCard({ todo, onToggle, onDelete, onEditTitle, onEditTags, onToggleEnergy, dragHandleProps }) {
  const tags = Array.isArray(todo.tags) ? todo.tags : []
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(todo.title)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [draftTags, setDraftTags] = useState(tags.join(', '))

  useEffect(() => {
    if (!isEditing) setDraftTitle(todo.title)
  }, [todo.title, isEditing])

  useEffect(() => {
    if (!isEditingTags) setDraftTags(tags.join(', '))
  }, [isEditingTags, tags])

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
      await onEditTitle(trimmed)
      setIsEditing(false)
    } catch (error) {
      console.error('failed to update todo title', error)
    }
  }

  const startEditingTags = () => {
    setDraftTags(tags.join(', '))
    setIsEditingTags(true)
  }

  const cancelEditingTags = () => {
    setDraftTags(tags.join(', '))
    setIsEditingTags(false)
  }

  const saveEditingTags = async () => {
    const nextTags = parseTags(draftTags)
    const current = tags.map(tag => tag.trim())
    const unchanged =
      nextTags.length === current.length &&
      nextTags.every((tag, index) => tag === current[index])

    if (unchanged) {
      setIsEditingTags(false)
      return
    }

    try {
      await onEditTags(nextTags)
      setIsEditingTags(false)
    } catch (error) {
      console.error('failed to update todo tags', error)
    }
  }

  const toggleEnergy = async () => {
    const nextEnergy = todo.energy === 'low' ? 'high' : 'low'
    try {
      await onToggleEnergy(nextEnergy)
    } catch (error) {
      console.error('failed to toggle todo energy', error)
    }
  }

  const dragProps = dragHandleProps ? { ...dragHandleProps } : {}
  const suppressDragPropagation = dragHandleProps
    ? (event) => {
        event.stopPropagation()
      }
    : undefined

  return (
    <article
      className={`card energy-${todo.energy} ${todo.completed ? 'is-complete' : ''} ${dragHandleProps ? 'is-draggable' : ''}`}
      data-completed={todo.completed ? 'true' : 'false'}
      {...dragProps}
    >
      <div className="card-left">
        <button
          type="button"
          className="checkbox"
          onClick={onToggle}
          aria-pressed={todo.completed}
          onPointerDown={suppressDragPropagation}
          onKeyDownCapture={suppressDragPropagation}
        >
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
            <EnergyBadge
              energy={todo.energy}
              onClick={toggleEnergy}
              onPointerDown={suppressDragPropagation}
              onKeyDownCapture={suppressDragPropagation}
            />
            <div className={`card-tags ${isEditingTags ? 'is-editing' : ''}`} aria-label="Task tags">
              {isEditingTags ? (
                <input
                  type="text"
                  className="tag-inline-input"
                  value={draftTags}
                  onChange={event => setDraftTags(event.target.value)}
                  onBlur={saveEditingTags}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      saveEditingTags()
                    }

                    if (event.key === 'Escape') {
                      event.preventDefault()
                      cancelEditingTags()
                    }
                  }}
                  onPointerDown={suppressDragPropagation}
                  onKeyDownCapture={suppressDragPropagation}
                  aria-label="Edit task tags"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  className="tag-inline-trigger"
                  onClick={startEditingTags}
                  onPointerDown={suppressDragPropagation}
                  onKeyDownCapture={suppressDragPropagation}
                  aria-label="Edit task tags"
                >
                  {tags.length > 0 ? tags.map(tag => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  )) : <span className="tag-empty">Add tags</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="delete"
        onClick={onDelete}
        aria-label="Delete todo"
        onPointerDown={suppressDragPropagation}
        onKeyDownCapture={suppressDragPropagation}
      >
        Delete
      </button>
    </article>
  )
}
