import { useEffect, useState } from 'react'
import axios from 'axios'

/**
 * @typedef {{
 * id: number,
 * title: string,
 * energy: 'low' | 'high' | 'medium',
 * tags: string[],
 * completed: boolean,
 * completedAt?: number | null
 * }} Todo
 */

const normalizeTodo = (todo) => ({
  ...todo,
  tags: Array.isArray(todo?.tags) ? todo.tags : [],
  completedAt: typeof todo?.completedAt === 'number' ? todo.completedAt : null
})

const moveTodoByCompletionTransition = (prev, nextTodo) => {
  const existingIndex = prev.findIndex(todo => todo.id === nextTodo.id)
  if (existingIndex === -1) return prev

  const existingTodo = prev[existingIndex]
  const rest = prev.filter(todo => todo.id !== nextTodo.id)
  const transitioned = existingTodo.completed !== nextTodo.completed

  if (!transitioned) {
    const updated = [...prev]
    updated[existingIndex] = nextTodo
    return updated
  }

  if (nextTodo.completed) {
    const activeCount = rest.filter(todo => !todo.completed).length
    return [...rest.slice(0, activeCount), nextTodo, ...rest.slice(activeCount)]
  }

  return [nextTodo, ...rest]
}

const reorderActiveInState = (prev, activeIds) => {
  const active = prev.filter(todo => !todo.completed)
  const completed = prev.filter(todo => todo.completed)
  const activeById = new Map(active.map(todo => [todo.id, todo]))

  const reorderedActive = activeIds
    .map(id => activeById.get(id))
    .filter(Boolean)

  if (reorderedActive.length !== active.length) return prev
  return [...reorderedActive, ...completed]
}

const insertCreatedTodo = (prev, nextTodo) => {
  const activeCount = prev.filter(todo => !todo.completed).length
  if (nextTodo.energy === 'high') {
    return [...prev.slice(0, activeCount), nextTodo, ...prev.slice(activeCount)]
  }

  return [nextTodo, ...prev]
}

export default function useTodos() {
  /** @type {[Todo[], Function]} */
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/todos')
      setTodos((Array.isArray(res.data) ? res.data : []).map(normalizeTodo))
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(e)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTodos() }, [])

  // subscribe to server-sent events for live updates
  useEffect(() => {
    const es = new EventSource('/api/events')

    es.addEventListener('message', (ev) => {
      try {
        const payload = JSON.parse(ev.data)
        if (payload.type === 'create' && payload.todo) {
          const nextTodo = normalizeTodo(payload.todo)
          setTodos(prev => {
            // avoid duplicate
            if (prev.find(t => t.id === nextTodo.id)) return prev
            return insertCreatedTodo(prev, nextTodo)
          })
        } else if (payload.type === 'update' && payload.todo) {
          const nextTodo = normalizeTodo(payload.todo)
          setTodos(prev => moveTodoByCompletionTransition(prev, nextTodo))
        } else if (payload.type === 'reorder' && payload.todos) {
          const nextTodos = Array.isArray(payload.todos) ? payload.todos.map(normalizeTodo) : []
          setTodos(nextTodos)
        } else if (payload.type === 'delete' && payload.id) {
          setTodos(prev => prev.filter(t => t.id !== payload.id))
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('failed to parse SSE payload', e)
        }
      }
    })

    es.addEventListener('error', (e) => {
      // EventSource will auto-retry; log for debugging
      if (import.meta.env.DEV) {
        console.warn('SSE error', e)
      }
    })

    return () => es.close()
  }, [])

  const createTodo = async (payload) => {
    const res = await axios.post('/api/todos', payload)
    const nextTodo = normalizeTodo(res.data)
    setTodos(prev => {
      if (prev.find(t => t.id === nextTodo.id)) return prev
      return insertCreatedTodo(prev, nextTodo)
    })
    return nextTodo
  }

  const updateTodo = async (id, payload) => {
    const res = await axios.patch(`/api/todos/${id}`, payload)
    // rely on server-sent events to update local state to avoid races
    return res.data
  }

  const reorderActive = async (activeIds) => {
    setTodos(prev => reorderActiveInState(prev, activeIds))
    const res = await axios.post('/api/todos/reorder', { active_ids: activeIds })
    const normalized = (Array.isArray(res.data) ? res.data : []).map(normalizeTodo)
    setTodos(normalized)
    return normalized
  }

  const deleteTodo = async (id) => {
    await axios.delete(`/api/todos/${id}`)
    // rely on server-sent events to update local state
  }

  return { todos, loading, fetchTodos, createTodo, updateTodo, deleteTodo, reorderActive }
}
