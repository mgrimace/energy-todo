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

    es.addEventListener('message', () => {
      fetchTodos()
    })

    es.addEventListener('error', (e) => {
      if (import.meta.env.DEV) {
        console.warn('SSE error', e)
      }
    })

    return () => es.close()
  }, [])

  const createTodo = async (payload) => {
    const res = await axios.post('/api/todos', payload)
    return normalizeTodo(res.data)
  }

  const updateTodo = async (id, payload) => {
    const res = await axios.patch(`/api/todos/${id}`, payload)
    return res.data
  }

  const reorderActive = async (activeIds) => {
    const res = await axios.post('/api/todos/reorder', { active_ids: activeIds })
    const normalized = (Array.isArray(res.data) ? res.data : []).map(normalizeTodo)
    setTodos(normalized)
    return normalized
  }

  const deleteTodo = async (id) => {
    await axios.delete(`/api/todos/${id}`)
  }

  const clearCompleted = async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id)
    await Promise.all(completedIds.map(id => axios.delete(`/api/todos/${id}`)))
  }

  return { todos, loading, fetchTodos, createTodo, updateTodo, deleteTodo, clearCompleted, reorderActive }
}
