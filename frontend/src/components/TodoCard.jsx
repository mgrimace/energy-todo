import React, { useEffect, useRef, useState } from 'react'
import EnergyBadge from './EnergyBadge'
import useTagInputController from '../hooks/useTagInputController'
import { CheckIcon, SquareIcon, ArrowsOutLineVerticalIcon } from '@phosphor-icons/react'

const SWIPE_THRESHOLD = 80
const SWIPE_EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

export default function TodoCard({ todo, onToggle, onDelete, onEditTitle, onEditTags, onToggleEnergy, dragHandleProps, isDraggingOverlay }) {
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

  const toggleEnergy = async (event) => {
    const energyOrder = ['low', 'medium', 'high']
    const currentIndex = Math.max(energyOrder.indexOf(todo.energy), 0)
    const rect = event.currentTarget.getBoundingClientRect()
    const isLeft = event.clientX < rect.left + rect.width / 2
    const nextIndex = isLeft
      ? (currentIndex - 1 + energyOrder.length) % energyOrder.length
      : (currentIndex + 1) % energyOrder.length
    const nextEnergy = energyOrder[nextIndex]
    try {
      await onToggleEnergy(nextEnergy)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('failed to toggle todo energy', error)
      }
    }
  }

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
        lastX: e.clientX,
        lastTime: performance.now(),
        velocity: 0,
      }
    }
    wrapper.addEventListener('pointerdown', handleDown, { capture: true })
    return () => wrapper.removeEventListener('pointerdown', handleDown, { capture: true })
  }, [isEditing, isEditingTags])

  function resetCard() {
    const card = cardRef.current
    if (!card) return
    card.style.transition = `transform 200ms ${SWIPE_EASING}`
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

    const now = performance.now()
    const dt = now - s.lastTime
    if (dt > 0) {
      s.velocity = (e.clientX - s.lastX) / dt
    }
    s.lastX = e.clientX
    s.lastTime = now

    s.dx = dx

    const progress = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1)
    wrapperRef.current?.style.setProperty('--swipe-progress', progress)

    if (wrapperRef.current) {
      wrapperRef.current.dataset.swipeDir = dx >= 0 ? 'right' : 'left'
    }

    const card = cardRef.current
    if (!card) return

    const MAGNET_ZONE = 24
    const distance = Math.abs(dx)

    let dxAdjusted = dx

    if (distance > SWIPE_THRESHOLD) {
      const extra = distance - SWIPE_THRESHOLD
      dxAdjusted = Math.sign(dx) * (SWIPE_THRESHOLD + extra * 0.35)
    }

    if (distance > SWIPE_THRESHOLD - MAGNET_ZONE && distance < SWIPE_THRESHOLD) {
      const t = (distance - (SWIPE_THRESHOLD - MAGNET_ZONE)) / MAGNET_ZONE
      dxAdjusted += Math.sign(dx) * t * 6
    }

    card.style.transform = `translateX(${dxAdjusted}px)`
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
    const velocity = s.velocity ?? 0
    const VELOCITY_THRESHOLD = 0.5
    const card = cardRef.current
    wrapperRef.current?.style.removeProperty('--swipe-progress')
    swipe.current = null

    const shouldComplete = dx > SWIPE_THRESHOLD || (velocity > VELOCITY_THRESHOLD && dx > 0)
    const shouldDelete = dx < -SWIPE_THRESHOLD || (velocity < -VELOCITY_THRESHOLD && dx < 0)

    if (shouldComplete) {
      if (card) {
        card.style.transition = `transform 200ms ${SWIPE_EASING}, opacity 180ms ease-out`
        card.style.transform = 'translateX(110%)'
        card.style.opacity = '0'
      }
      setTimeout(() => {
        onToggle()
        if (card) { card.style.transition = ''; card.style.transform = ''; card.style.opacity = '' }
      }, 160)
    } else if (shouldDelete) {
      if (card) { card.style.transition = `transform 200ms ${SWIPE_EASING}`; card.style.transform = 'translateX(-110%)' }
      setTimeout(() => {
        onDelete()
        if (card) { card.style.transition = ''; card.style.transform = '' }
      }, 200)
    } else {
      resetCard()
    }
  }

  function handleSwipeCancel() {
    const s = swipe.current
    if (s?.active) {
      try { wrapperRef.current?.releasePointerCapture(s.pointerId) } catch {}
      resetCard()
    }
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
        ref={cardRef}
      >
      <div className="card-left">
        <button
          type="button"
          className="checkbox"
          onClick={onToggle}
          aria-pressed={todo.completed}
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
              variant="list"
              onClick={toggleEnergy}
            />
            <div className={`card-tags ${isEditingTags ? 'is-editing' : ''}`} aria-label="Task tags">
              {isEditingTags ? (
                <div
                  className="tag-inline-editor"
                  onBlur={handleTagEditorBlur}
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
                      const handled = onTagEditorKeyDown(event)
                      if (handled) return
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        cancelEditingTags()
                      }
                    }}
                    onPaste={onTagEditorPaste}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="tag-inline-trigger"
                  onClick={() => startEditingTags()}
                  onKeyDown={onTagTriggerKeyDown}
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
        className="drag-handle"
        aria-label="Drag to reorder"
        aria-hidden={isDraggingOverlay ? true : undefined}
        tabIndex={isDraggingOverlay ? -1 : undefined}
        {...(dragHandleProps && !isDraggingOverlay ? dragHandleProps : {})}
        onPointerDown={dragHandleProps && !isDraggingOverlay
          ? (e) => { e.stopPropagation(); dragHandleProps.onPointerDown?.(e) }
          : undefined
        }
      >
        <ArrowsOutLineVerticalIcon size={16} />
      </button>
    </article>
    </div>
  )
}
