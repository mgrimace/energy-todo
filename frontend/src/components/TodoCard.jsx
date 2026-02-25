import React from 'react'
import EnergyBadge from './EnergyBadge'

export default function TodoCard({ todo, onToggle, onDelete }) {
  return (
    <article className={`card ${todo.completed ? 'is-complete' : ''}`}>
      <div className="card-left">
        <button type="button" className="checkbox" onClick={onToggle} aria-pressed={todo.completed}>
          {todo.completed ? '✓' : ''}
        </button>
        <div className="card-body">
          <div className="title">{todo.title}</div>
          <div className="meta">
            <EnergyBadge energy={todo.energy} />
          </div>
        </div>
      </div>
      <button type="button" className="delete" onClick={onDelete} aria-label="Delete todo">Delete</button>
    </article>
  )
}
