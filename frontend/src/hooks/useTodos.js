import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'

const SSE_RECONNECT_MS = 3_000
const SSE_LIVENESS_MS = 35_000

export default function useTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const eventSourceRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const connectInFlightRef = useRef(false)
  const lastResumeAtRef = useRef(0)
  const lastEventIdRef = useRef(null)
  const lastActivityRef = useRef(Date.now())
  const tempTodoIdRef = useRef(0)

  const cloneTodo = (todo) => {
    if (!todo) return null

    return {
      ...todo,
      tags: Array.isArray(todo.tags) ? [...todo.tags] : [],
    }
  }

  const restoreTodoAtIndex = (prev, todo, index) => {
    const remaining = prev.filter(item => item.id !== todo.id)
    const nextIndex = Math.min(Math.max(index, 0), remaining.length)
    return [...remaining.slice(0, nextIndex), todo, ...remaining.slice(nextIndex)]
  }

  const applyOptimisticUpdate = (prev, id, payload) => {
    const previousTodo = prev.find(todo => todo.id === id)
    if (!previousTodo) return prev

    const nextTodo = {
      ...previousTodo,
      ...payload,
      tags: payload.tags ?? previousTodo.tags,
      completedAt: payload.completed === undefined
        ? previousTodo.completedAt
        : payload.completed
          ? Date.now()
          : null,
    }

    if (payload.completed === undefined || payload.completed === previousTodo.completed) {
      return prev.map(todo => (todo.id === id ? nextTodo : todo))
    }

    const remaining = prev.filter(todo => todo.id !== id)
    const active = remaining.filter(todo => !todo.completed)
    const completed = remaining.filter(todo => todo.completed)

    return nextTodo.completed
      ? [...active, nextTodo, ...completed]
      : [nextTodo, ...active, ...completed]
  }

  const loadTodos = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await axios.get('/api/todos', { headers: { 'Cache-Control': 'no-store' } })
      setTodos(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      if (import.meta.env.DEV) console.error(e)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // connectSSE reuses the last seen event ID so reconnects can replay missed
  // events without forcing a full refetch.
  const connectSSE = useCallback(async () => {
    if (connectInFlightRef.current) return
    connectInFlightRef.current = true

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    try {
      const lastEventId = lastEventIdRef.current
      const url = typeof lastEventId === 'number'
        ? `/api/events?last_event_id=${lastEventId}`
        : '/api/events'
      const es = new EventSource(url)
      eventSourceRef.current = es

      es.addEventListener('open', () => {
        lastActivityRef.current = Date.now()
      })

      es.addEventListener('keepalive', () => {
        lastActivityRef.current = Date.now()
      })

      es.addEventListener('message', (e) => {
        lastActivityRef.current = Date.now()

        const parsedEventId = Number.parseInt(e.lastEventId, 10)
        if (Number.isFinite(parsedEventId)) {
          lastEventIdRef.current = parsedEventId
        }

        let msg
        try {
          msg = JSON.parse(e.data)
        } catch {
          loadTodos(true)
          return
        }

        let valid = false
        switch (msg.type) {
          case 'reset':
            loadTodos(true)
            valid = true
            break
          case 'create':
            if (msg.todo && typeof msg.todo.id !== 'undefined') {
              setTodos(prev => prev.some(t => t.id === msg.todo.id)
                ? prev
                : [msg.todo, ...prev])
              valid = true
            }
            break
          case 'update':
            if (msg.todo && typeof msg.todo.id !== 'undefined') {
              setTodos(prev => prev.map(t => t.id === msg.todo.id ? msg.todo : t))
              valid = true
            }
            break
          case 'delete':
            if (typeof msg.id !== 'undefined') {
              setTodos(prev => prev.filter(t => t.id !== msg.id))
              valid = true
            }
            break
          case 'reorder':
            if (Array.isArray(msg.todos)) {
              setTodos(msg.todos)
              valid = true
            }
            break
        }

        if (!valid) {
          loadTodos(true)
        }
      })

      es.addEventListener('error', (e) => {
        if (import.meta.env.DEV) console.warn('SSE error, reconnecting...', e)
        es.close()
        eventSourceRef.current = null
        reconnectTimerRef.current = setTimeout(() => { void connectSSE() }, SSE_RECONNECT_MS)
      })
    } finally {
      connectInFlightRef.current = false
    }
  }, [])

  // Initial mount: load todos once, then open SSE without a second fetch
  useEffect(() => {
    loadTodos(false)
    void connectSSE()
    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally omitting loadTodos/connectSSE: this must run once only.
  // Both are stable useCallback refs so there is no stale-closure risk.

  // On visibility/focus resume, reconnect only when SSE activity has gone
  // quiet long enough to treat the stream as dead.
  useEffect(() => {
    function handleResume() {
      const now = Date.now()
      if (now - lastResumeAtRef.current < 250) return
      lastResumeAtRef.current = now

      const recentlyActive = now - lastActivityRef.current < SSE_LIVENESS_MS
      const connectionOpen = eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED
      if (recentlyActive && connectionOpen) return

      void connectSSE()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') handleResume()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', handleResume)
    window.addEventListener('pageshow', handleResume)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', handleResume)
      window.removeEventListener('pageshow', handleResume)
    }
  }, [connectSSE])

  const createTodo = async (payload) => {
    const optimisticId = `temp-${Date.now()}-${tempTodoIdRef.current += 1}`
    const optimisticTodo = {
      id: optimisticId,
      title: payload.title,
      energy: payload.energy,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      completed: false,
      completedAt: null,
    }

    setTodos(prev => [optimisticTodo, ...prev])

    try {
      const res = await axios.post('/api/todos', payload)
      const createdTodo = res.data

      setTodos(prev => {
        const withoutOptimistic = prev.filter(todo => todo.id !== optimisticId)
        const existingIndex = withoutOptimistic.findIndex(todo => todo.id === createdTodo.id)

        if (existingIndex >= 0) {
          return withoutOptimistic.map(todo => (todo.id === createdTodo.id ? createdTodo : todo))
        }

        return [createdTodo, ...withoutOptimistic]
      })

      return createdTodo
    } catch (error) {
      setTodos(prev => prev.filter(todo => todo.id !== optimisticId))
      throw error
    }
  }

  const updateTodo = async (id, payload) => {
    let previousTodo = null
    let previousIndex = -1

    setTodos(prev => {
      previousIndex = prev.findIndex(todo => todo.id === id)
      previousTodo = cloneTodo(previousIndex >= 0 ? prev[previousIndex] : null)
      return applyOptimisticUpdate(prev, id, payload)
    })

    try {
      const res = await axios.patch(`/api/todos/${id}`, payload)
      const updatedTodo = res.data
      setTodos(prev => prev.map(todo => (todo.id === id ? updatedTodo : todo)))
      return updatedTodo
    } catch (error) {
      if (previousTodo) {
        setTodos(prev => restoreTodoAtIndex(prev, previousTodo, previousIndex))
      }
      throw error
    }
  }

  const reorderActive = async (activeIds) => {
    setTodos(prev => {
      const idOrder = new Map(activeIds.map((id, i) => [String(id), i]))
      const active = prev
        .filter(t => !t.completed)
        .sort((a, b) => (idOrder.get(String(a.id)) ?? Infinity) - (idOrder.get(String(b.id)) ?? Infinity))
      return [...active, ...prev.filter(t => t.completed)]
    })

    const res = await axios.post('/api/todos/reorder', { active_ids: activeIds })
    const reordered = Array.isArray(res.data) ? res.data : []
    setTodos(reordered)
    return reordered
  }

  const deleteTodo = async (id) => {
    let deletedTodo = null
    let deletedIndex = -1

    setTodos(prev => {
      deletedIndex = prev.findIndex(todo => todo.id === id)
      deletedTodo = cloneTodo(deletedIndex >= 0 ? prev[deletedIndex] : null)
      return prev.filter(todo => todo.id !== id)
    })

    try {
      await axios.delete(`/api/todos/${id}`)
    } catch (error) {
      if (deletedTodo) {
        setTodos(prev => restoreTodoAtIndex(prev, deletedTodo, deletedIndex))
      }
      throw error
    }
  }

  const clearCompleted = async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id)
    await Promise.all(completedIds.map(id => deleteTodo(id)))
  }

  return { todos, loading, createTodo, updateTodo, deleteTodo, clearCompleted, reorderActive, refetch: () => loadTodos(true) }
}