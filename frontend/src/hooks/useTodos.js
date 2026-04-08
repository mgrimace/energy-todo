import { useEffect, useState } from 'react'
import axios from 'axios'

export default function useTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTodos = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await axios.get('/api/todos')
      setTodos(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error(e)
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => { loadTodos() }, [])

  // subscribe to server-sent events for live updates
  useEffect(() => {
    const es = new EventSource('/api/events')

    es.addEventListener('message', () => { loadTodos(true) })

    es.addEventListener('error', (e) => {
      if (import.meta.env.DEV) {
        console.warn('SSE error', e)
      }
    })

    return () => es.close()
  }, [])

  const createTodo = async (payload) => {
    const res = await axios.post('/api/todos', payload)
    return res.data
  }

  const updateTodo = async (id, payload) => {
    const res = await axios.patch(`/api/todos/${id}`, payload)
    return res.data
  }

  const reorderActive = async (activeIds) => {
    setTodos(prev => {
      const idOrder = new Map(activeIds.map((id, i) => [String(id), i]))
      const active = prev
        .filter(t => !t.completed)
        .sort((a, b) => {
          const ai = idOrder.get(String(a.id)) ?? Infinity
          const bi = idOrder.get(String(b.id)) ?? Infinity
          return ai - bi
        })
      const completed = prev.filter(t => t.completed)
      return [...active, ...completed]
    })

    const res = await axios.post('/api/todos/reorder', { active_ids: activeIds })
    const reordered = Array.isArray(res.data) ? res.data : []
    setTodos(reordered)
    return reordered
  }

  const deleteTodo = async (id) => {
    await axios.delete(`/api/todos/${id}`)
  }

  const clearCompleted = async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id)
    await Promise.all(completedIds.map(id => axios.delete(`/api/todos/${id}`)))
  }

  return { todos, loading, createTodo, updateTodo, deleteTodo, clearCompleted, reorderActive }
}
