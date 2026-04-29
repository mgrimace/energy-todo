import React, { useState, useEffect } from 'react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChecksIcon,
  MagnifyingGlassIcon
} from '@phosphor-icons/react'
import useTodos from './hooks/useTodos'
import Header from './components/Header'
import FilterTabs from './components/FilterTabs'
import TodoCard from './components/TodoCard'
import TaskInput from './components/TaskInput'

function SortableActiveTodo({ todo, onToggle, onDelete, onEdit, onEditTags, onToggleEnergy }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(todo.id)
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className="sortable-item">
      <TodoCard
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEditTitle={onEdit}
        onEditTags={onEditTags}
        onToggleEnergy={onToggleEnergy}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

export default function App() {
  const { todos, loading, createTodo, updateTodo, deleteTodo, clearCompleted, reorderActive } = useTodos()

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const normalizedQuery = search.trim().toLowerCase()

  const matchesEnergyFilter = (todo) => {
    if (filter === 'quick') return todo.energy === 'low'
    if (filter === 'priority') return todo.energy === 'medium'
    if (filter === 'deep') return todo.energy === 'high'
    return true
  }

  const visible = todos.filter(todo => {
    if (!matchesEnergyFilter(todo)) return false
    if (!normalizedQuery) return true

    const title = (todo.title || '').toLowerCase()
    const tags = Array.isArray(todo.tags) ? todo.tags : []
    const matchesTitle = title.includes(normalizedQuery)
    const matchesTags = tags.some(tag => String(tag).toLowerCase().includes(normalizedQuery))

    return matchesTitle || matchesTags
  })

  const activeTodos = filter === 'completed'
    ? []
    : visible.filter(todo => !todo.completed)
  const allActiveTodos = todos.filter(todo => !todo.completed)

  const completedTodos = visible.filter(todo => todo.completed)

  const onDragStart = ({ active }) => setActiveId(active.id)
  const onDragCancel = () => setActiveId(null)

  const onActiveDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const visibleSourceIndex = activeTodos.findIndex(todo => String(todo.id) === String(active.id))
    const visibleTargetIndex = activeTodos.findIndex(todo => String(todo.id) === String(over.id))
    if (visibleSourceIndex === -1 || visibleTargetIndex === -1) return

    const reorderedVisible = arrayMove(activeTodos, visibleSourceIndex, visibleTargetIndex)
    const reorderedVisibleById = new Map(reorderedVisible.map(todo => [todo.id, todo]))

    let cursor = 0
    const reorderedAllActive = allActiveTodos.map(todo => {
      if (reorderedVisibleById.has(todo.id)) {
        const next = reorderedVisible[cursor]
        cursor += 1
        return next
      }
      return todo
    })

    reorderActive(reorderedAllActive.map(todo => todo.id)).catch(error => {
      if (import.meta.env.DEV) {
        console.error('failed to reorder active todos', error)
      }
    })
  }

  return (
    <div className="app">
      <Header />

      <main>
        <TaskInput
          disabled={loading}
          onAdd={async (title, energy, tags) => {
            await createTodo({ title, energy, tags })
          }}
        />

        <div className="list-controls">
          <div className="filter-row">
            <FilterTabs filter={filter} setFilter={setFilter} />
          </div>
          <label className="search" htmlFor="task-search">
            <span className="search-chip">
              <MagnifyingGlassIcon
                className="search-icon"
                weight="regular"
                aria-hidden="true"
              />
              <input
                id="task-search"
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search"
              />
            </span>
          </label>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="list">
            {activeTodos.length === 0 && completedTodos.length === 0 ? <p className="muted">No matching todos</p> : null}

            <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragStart={onDragStart} onDragEnd={onActiveDragEnd} onDragCancel={onDragCancel}>
              <div className="stacked-list active-stack">
                <SortableContext
                  items={activeTodos.map(todo => String(todo.id))}
                  strategy={verticalListSortingStrategy}
                >
                  {activeTodos.map(t => (
                    <SortableActiveTodo
                      key={t.id}
                      todo={t}
                      onToggle={() => updateTodo(t.id, { completed: !t.completed })}
                      onDelete={() => deleteTodo(t.id)}
                      onEdit={(title) => updateTodo(t.id, { title })}
                      onEditTags={(tags) => updateTodo(t.id, { tags })}
                      onToggleEnergy={(energy) => updateTodo(t.id, { energy })}
                    />
                  ))}
                </SortableContext>
              </div>
              <DragOverlay>
                {activeId ? (
                  <TodoCard
                    todo={todos.find(t => String(t.id) === String(activeId))}
                    onToggle={() => {}}
                    onDelete={() => {}}
                    onEditTitle={() => {}}
                    onEditTags={() => {}}
                    onToggleEnergy={() => {}}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            {completedTodos.length > 0 ? (
              <section className="completed-section" aria-label="Completed todos">
                <div className="completed-divider">
                  <span className="completed-divider-rule" aria-hidden="true" />
                  <span>Completed</span>
                  <span className="completed-divider-rule" aria-hidden="true" />
                  <button
                    type="button"
                    className="completed-clear-btn"
                    onClick={clearCompleted}
                    aria-label="Delete all completed tasks"
                  >
                    Clear all
                    <ChecksIcon weight="bold" aria-hidden="true" />
                  </button>
                </div>
                <div className="completed-list stacked-list">
                  {completedTodos.map(t => (
                    <TodoCard
                      key={t.id}
                      todo={t}
                      onToggle={() => updateTodo(t.id, { completed: !t.completed })}
                      onDelete={() => deleteTodo(t.id)}
                      onEditTitle={(title) => updateTodo(t.id, { title })}
                      onEditTags={(tags) => updateTodo(t.id, { tags })}
                      onToggleEnergy={(energy) => updateTodo(t.id, { energy })}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
