import React, { useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useTodos from './hooks/useTodos'
import Header from './components/Header'
import FilterTabs from './components/FilterTabs'
import TodoCard from './components/TodoCard'
import TaskInput from './components/TaskInput'

function SortableActiveTodo({ todo, onToggle, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(todo.id)
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} className={`sortable-item ${isDragging ? 'is-dragging' : ''}`}>
      <TodoCard
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
        onEdit={onEdit}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

export default function App() {
  const { todos, loading, createTodo, updateTodo, deleteTodo, reorderActive } = useTodos()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const normalizedQuery = search.trim().toLowerCase()

  const matchesEnergyFilter = (todo) => {
    if (filter === 'quick') return todo.energy === 'low'
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

  const onActiveDragEnd = ({ active, over }) => {
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
      console.error('failed to reorder active todos', error)
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
          <FilterTabs filter={filter} setFilter={setFilter} />
          <label className="search" htmlFor="task-search">
            <span className="search-chip">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
                <path d="M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14Zm9 16-3.8-3.8" />
              </svg>
              <input
                id="task-search"
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search tasks or tags"
              />
            </span>
          </label>
        </div>

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="list">
            {activeTodos.length === 0 && completedTodos.length === 0 ? <p className="muted">No matching todos</p> : null}

            <DndContext sensors={sensors} onDragEnd={onActiveDragEnd}>
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
                  />
                ))}
              </SortableContext>
            </DndContext>

            {completedTodos.length > 0 ? (
              <section className="completed-section" aria-label="Completed todos">
                <div className="completed-divider" role="separator" aria-hidden="true">
                  <span>Completed</span>
                </div>
                <div className="completed-list">
                  {completedTodos.map(t => (
                    <TodoCard
                      key={t.id}
                      todo={t}
                      onToggle={() => updateTodo(t.id, { completed: !t.completed })}
                      onDelete={() => deleteTodo(t.id)}
                      onEdit={(title) => updateTodo(t.id, { title })}
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
