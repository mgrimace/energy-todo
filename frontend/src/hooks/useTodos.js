import { useEffect, useState } from 'react'
import axios from 'axios'

export default function useTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/todos')
      setTodos(res.data)
    } catch (e) {
      console.error(e)
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
          setTodos(prev => {
            // avoid duplicate
            if (prev.find(t => t.id === payload.todo.id)) return prev
            return [...prev, payload.todo]
          })
        } else if (payload.type === 'update' && payload.todo) {
          setTodos(prev => prev.map(t => t.id === payload.todo.id ? payload.todo : t))
        } else if (payload.type === 'delete' && payload.id) {
          setTodos(prev => prev.filter(t => t.id !== payload.id))
        }
      } catch (e) {
        console.error('failed to parse SSE payload', e)
      }
    })

    es.addEventListener('error', (e) => {
      // EventSource will auto-retry; log for debugging
      console.warn('SSE error', e)
    })

    return () => es.close()
  }, [])

  const createTodo = async (payload) => {
    const res = await axios.post('/api/todos', payload)
    setTodos(prev => {
      if (prev.find(t => t.id === res.data.id)) return prev
      return [...prev, res.data]
    })
    return res.data
  }

  const updateTodo = async (id, payload) => {
    const res = await axios.patch(`/api/todos/${id}`, payload)
    // rely on server-sent events to update local state to avoid races
    return res.data
  }

  const deleteTodo = async (id) => {
    await axios.delete(`/api/todos/${id}`)
    // rely on server-sent events to update local state
  }

  return { todos, loading, fetchTodos, createTodo, updateTodo, deleteTodo }
}
