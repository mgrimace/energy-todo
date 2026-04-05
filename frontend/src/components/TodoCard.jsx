import React, { useEffect, useRef, useState } from 'react'
import EnergyBadge from './EnergyBadge'
import useTagInputController from '../hooks/useTagInputController'
import { CheckIcon, SquareIcon, ArrowsOutLineVerticalIcon } from '@phosphor-icons/react'

export default function TodoCard({ todo, onToggle, onDelete, onEditTitle, onEditTags, onToggleEnergy, dragHandleProps }) {
  const tags = Array.isArray(todo.tags) ? todo.tags : []
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(todo.title)
  const [isEditingTags, setIsEditingTags] = useState(false)

  // Swipe gesture refs
  const wrapperRef = useRef(null)
  const cardRef = useRef(null)
  const swipe = useRef(null)
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
        onTagEditorKeyDown(syntheticEvent)
        pendingTagKeyRef.current = null
      }
    }
  }, [isEditingTags, onTagEditorKeyDown])

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

  const suppressDragPropagation = (event) => {
    event.stopPropagation()
  }

  // Capture-phase pointerdown to start swipe tracking
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const handleDown = (e) => {
      if (isEditing || isEditingTags) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      if (e.target.closest?.('.drag-handle')) return
      swipe.current = {
        startX: e.clientX,
        active: false,
        pointerId: e.pointerId,
        dx: 0,
      }
    }
    wrapper.addEventListener('pointerdown', handleDown, { capture: true })
    return () => wrapper.removeEventListener('pointerdown', handleDown, { capture: true })
  }, [isEditing, isEditingTags])

  function resetCard() {
    const card = cardRef.current
    if (!card) return
    card.style.transition = 'transform 0.2s ease'
    card.style.transform = 'translateX(0)'
    card.addEventListener('transitionend', () => { card.style.transition = '' }, { once: true })
  }

  function handleSwipeMove(e) {
    const s = swipe.current
    if (!s) return

    const dx = e.clientX - s.startX

    if (Math.abs(dx) < 8) return

    if (!s.active) {
      s.active = true
      wrapperRef.current?.setPointerCapture(s.pointerId)
    }

    s.dx = dx

    const progress = Math.min(Math.abs(dx) / 80, 1)
    wrapperRef.current?.style.setProperty('--swipe-progress', progress)

    if (wrapperRef.current) {
      wrapperRef.current.dataset.swipeDir = dx >= 0 ? 'right' : 'left'
    }

    const card = cardRef.current
    if (!card) return
    const limit = 120
    const dxLimited = Math.abs(dx) < limit
      ? dx
      : Math.sign(dx) * (limit + (Math.abs(dx) - limit) * 0.3)

    card.style.transform = `translateX(${dxLimited}px)`
  }

  function handleSwipeUp() {
    const s = swipe.current
    if (!s) return

    try {
      wrapperRef.current?.releasePointerCapture(s.pointerId)
    } catch {}

    if (!s.active) { swipe.current = null; return }

    if (wrapperRef.current) wrapperRef.current.removeAttribute('data-swipe-dir')
    const dx = s.dx
    const THRESHOLD = 80
    const card = cardRef.current
    wrapperRef.current?.style.removeProperty('--swipe-progress')
    swipe.current = null

    if (dx > THRESHOLD) {
      if (card) { card.style.transition = 'transform 0.3s ease'; card.style.transform = 'translateX(110%)' }
      setTimeout(() => {
        onToggle()
        if (card) { card.style.transition = ''; card.style.transform = '' }
      }, 300)
    } else if (dx < -THRESHOLD) {
      if (card) { card.style.transition = 'transform 0.3s ease'; card.style.transform = 'translateX(-110%)' }
      setTimeout(() => {
        onDelete()
        if (card) { card.style.transition = ''; card.style.transform = '' }
      }, 300)
    } else {
      resetCard()
    }
  }

  function handleSwipeCancel() {
    const s = swipe.current

    if (s?.pointerId) {
      try {
        wrapperRef.current?.releasePointerCapture(s.pointerId)
      } catch {}
    }

    if (s?.active) resetCard()
    if (wrapperRef.current) wrapperRef.current.removeAttribute('data-swipe-dir')
    wrapperRef.current?.style.removeProperty('--swipe-progress')
    swipe.current = null
  }

  return (
    <div
      className="todo-swipe-wrapper"
      style={{
        '--swipe-accent-bg': `var(--energy-${todo.energy}-bg)`,
        '--swipe-accent-text': `var(--energy-${todo.energy}-text)`,
      }}
      ref={wrapperRef}
      onPointerMove={handleSwipeMove}
      onPointerUp={handleSwipeUp}
      onPointerCancel={handleSwipeCancel}
    >
      <div className="todo-swipe-bg" aria-hidden="true">
        <div className="swipe-complete">
          <span className="swipe-icon">
            {todo.completed ? <SquareIcon size={16} /> : <CheckIcon size={16} />}
          </span>
        </div>
        <div className="swipe-delete">Delete</div>
      </div>
      <article
        className={`card energy-${todo.energy} ${todo.completed ? 'is-complete' : ''}`}
        data-completed={todo.completed ? 'true' : 'false'}
        ref={cardRef}
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
      {dragHandleProps && (
        <button
          type="button"
          className="drag-handle"
          aria-label="Drag to reorder"
          {...dragHandleProps}
          onPointerDown={(e) => { e.stopPropagation(); dragHandleProps.onPointerDown?.(e) }}
        >
          <ArrowsOutLineVerticalIcon size={16} />
        </button>
      )}
    </article>
    </div>
  )
}
