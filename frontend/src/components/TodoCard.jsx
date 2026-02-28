import React, { useEffect, useRef, useState } from 'react'
import EnergyBadge from './EnergyBadge'
import useTagInputController from '../hooks/useTagInputController'

export default function TodoCard({ todo, onToggle, onDelete, onEditTitle, onEditTags, onToggleEnergy, dragHandleProps }) {
  const tags = Array.isArray(todo.tags) ? todo.tags : []
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(todo.title)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const {
    tags: editingTags,
    inputValue: editingTagInput,
    onInputChange: onTagEditorChange,
    onKeyDown: onTagEditorKeyDown,
    onPaste: onTagEditorPaste,
    replaceTags: resetTagEditor,
    getSnapshot: getTagEditorSnapshot
  } = useTagInputController(tags)
  const tagEditorInputRef = useRef(null)
  const pendingTagKeyRef = useRef(null)
  const tagKeyHandlerRef = useRef(onTagEditorKeyDown)

  useEffect(() => {
    if (!isEditing) setDraftTitle(todo.title)
  }, [todo.title, isEditing])

  useEffect(() => {
    if (!isEditingTags) resetTagEditor(tags)
  }, [isEditingTags, tags, resetTagEditor])

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
      if (import.meta.env.DEV) {
        console.error('failed to update todo title', error)
      }
    }
  }

  const startEditingTags = (options = {}) => {
    resetTagEditor(tags)
    pendingTagKeyRef.current = options?.pendingKey || null
    setIsEditingTags(true)
  }

  const cancelEditingTags = () => {
    pendingTagKeyRef.current = null
    resetTagEditor(tags)
    setIsEditingTags(false)
  }

  const saveEditingTags = async () => {
    const nextTags = getTagEditorSnapshot()
    const current = tags.map(tag => tag.trim())
    const unchanged =
      nextTags.length === current.length &&
      nextTags.every((tag, index) => tag === current[index])

    if (unchanged) {
      resetTagEditor(tags)
      setIsEditingTags(false)
      return
    }

    try {
      await onEditTags(nextTags)
      setIsEditingTags(false)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('failed to update todo tags', error)
      }
    }
  }

  const handleTagEditorBlur = (event) => {
    const nextFocus = event.relatedTarget
    if (nextFocus && event.currentTarget.contains(nextFocus)) return
    saveEditingTags()
  }

  useEffect(() => {
    tagKeyHandlerRef.current = onTagEditorKeyDown
  }, [onTagEditorKeyDown])

  useEffect(() => {
    if (!isEditingTags) {
      pendingTagKeyRef.current = null
      return
    }

    const input = tagEditorInputRef.current
    if (input) {
      input.focus()
      if (pendingTagKeyRef.current) {
        const syntheticEvent = {
          key: pendingTagKeyRef.current,
          preventDefault: () => {},
          stopPropagation: () => {}
        }
        tagKeyHandlerRef.current?.(syntheticEvent)
        pendingTagKeyRef.current = null
      }
    }
  }, [isEditingTags])

  const onTagTriggerKeyDown = (event) => {
    suppressDragPropagation?.(event)
    if (isEditingTags) return
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()
      if (tags.length === 0) {
        startEditingTags()
        return
      }
      startEditingTags({ pendingKey: event.key === 'Delete' ? 'Delete' : 'Backspace' })
    }
  }

  const toggleEnergy = async () => {
    const energyOrder = ['low', 'medium', 'high']
    const currentIndex = Math.max(energyOrder.indexOf(todo.energy), 0)
    const nextEnergy = energyOrder[(currentIndex + 1) % energyOrder.length]
    try {
      await onToggleEnergy(nextEnergy)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('failed to toggle todo energy', error)
      }
    }
  }

  const editingLocksDrag = isEditing || isEditingTags
  const dragProps = dragHandleProps && !editingLocksDrag ? { ...dragHandleProps } : {}
  const suppressDragPropagation = dragHandleProps && !editingLocksDrag
    ? (event) => {
        event.stopPropagation()
      }
    : undefined

  return (
    <article
      className={`card energy-${todo.energy} ${todo.completed ? 'is-complete' : ''} ${dragHandleProps && !editingLocksDrag ? 'is-draggable' : ''}`}
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
              onPointerDown={suppressDragPropagation}
              onKeyDownCapture={suppressDragPropagation}
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
                <div
                  className="tag-inline-editor"
                  onBlur={handleTagEditorBlur}
                  onPointerDown={suppressDragPropagation}
                  role="group"
                  aria-label="Edit task tags"
                >
                  {editingTags.map((tag, index) => (
                    <span key={`${tag}-${index}`} className="tag-pill">{tag}</span>
                  ))}
                  <input
                    type="text"
                    ref={tagEditorInputRef}
                    className="tag-inline-input"
                    value={editingTagInput}
                    onChange={onTagEditorChange}
                    onKeyDown={(event) => {
                      suppressDragPropagation?.(event)
                      const handled = onTagEditorKeyDown(event)
                      if (handled) return
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        cancelEditingTags()
                      }
                    }}
                    onPaste={onTagEditorPaste}
                    onPointerDown={suppressDragPropagation}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="tag-inline-trigger"
                  onClick={() => startEditingTags()}
                  onKeyDown={onTagTriggerKeyDown}
                  onPointerDown={suppressDragPropagation}
                  aria-label="Edit task tags"
                >
                  {tags.length > 0 ? tags.map(tag => (
                    <span key={tag} className="tag-pill">{tag}</span>
                  )) : null}
                  <span className="tag-add-affordance" aria-hidden="true">+</span>
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
