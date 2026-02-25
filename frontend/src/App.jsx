import React, { useState } from 'react'
import useTodos from './hooks/useTodos'
import Header from './components/Header'
import FilterTabs from './components/FilterTabs'
import TodoCard from './components/TodoCard'
import TaskInput from './components/TaskInput'

export default function App() {
  const { todos, loading, createTodo, updateTodo, deleteTodo } = useTodos()
  const [filter, setFilter] = useState('all')

  const filtered = todos.filter(t => {
    if (filter === 'all') return true
    if (filter === 'quick') return t.energy === 'low'
    if (filter === 'deep') return t.energy === 'high'
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <div className="app">
      <Header />

      <main>
        <TaskInput
          disabled={loading}
          onAdd={async (title, energy) => {
            await createTodo({ title, energy })
          }}
        />

        <FilterTabs filter={filter} setFilter={setFilter} />

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="list">
            {filtered.length === 0 ? <p className="muted">No todos</p> : null}
            {filtered.map(t => (
              <TodoCard
                key={t.id}
                todo={t}
                onToggle={() => updateTodo(t.id, { completed: !t.completed })}
                onDelete={() => deleteTodo(t.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
