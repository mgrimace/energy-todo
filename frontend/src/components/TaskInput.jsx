import React, { useState } from 'react'

export default function TaskInput({ onAdd, disabled }) {
  const [title, setTitle] = useState('')
  const [energy, setEnergy] = useState('low')

  const submit = async (event) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    await onAdd(trimmedTitle, energy)
    setTitle('')
    setEnergy('low')
  }

  return (
    <form className="task-input" onSubmit={submit}>
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
    </form>
  )
}
