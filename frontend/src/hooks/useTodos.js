import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'

export default function useTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const eventSourceRef = useRef(null)
  const lastActiveRef = useRef(Date.now())

  const loadTodos = useCallback(async (silent = false) => {
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
  }, [])

  useEffect(() => { loadTodos() }, [loadTodos])

  const initEventSource = useCallback(() => {
    const es = new EventSource('/api/events')
    eventSourceRef.current = es

    es.addEventListener('message', () => { loadTodos(true) })

    es.addEventListener('error', (e) => {
      if (import.meta.env.DEV) {
        console.warn('SSE error', e)
      }
    })

    return es
  }, [loadTodos])

  // subscribe to server-sent events for live updates
  useEffect(() => {
    const es = initEventSource()
    return () => es.close()
  }, [initEventSource])

  // reconnect SSE and refetch data when app resumes after inactivity
  useEffect(() => {
    function handleResume() {
      const now = Date.now()
      const elapsed = now - lastActiveRef.current
      lastActiveRef.current = now

      if (elapsed > 60000) {
        window.location.reload()
        return
      }

      if (elapsed > 10000) {
        loadTodos(true)
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }
        initEventSource()
      }
    }

    const onVisibility = () => { if (document.visibilityState === 'visible') handleResume() }
    window.addEventListener('focus', handleResume)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', handleResume)
    return () => {
      window.removeEventListener('focus', handleResume)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', handleResume)
    }
  }, [loadTodos, initEventSource])

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

  return { todos, loading, createTodo, updateTodo, deleteTodo, clearCompleted, reorderActive, refetch: () => loadTodos(true) }
}
