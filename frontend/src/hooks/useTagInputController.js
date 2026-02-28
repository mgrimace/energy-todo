import { useCallback, useState } from 'react'

const normalizeTagValue = (value) => value.trim().replace(/,+$/g, '')

const addTagToCollection = (collection, rawValue) => {
  const normalized = normalizeTagValue(rawValue)
  if (!normalized) return collection

  const exists = collection.some(tag => tag.toLowerCase() === normalized.toLowerCase())
  return exists ? collection : [...collection, normalized]
}

const addSegmentsToCollection = (collection, segments) => {
  if (!Array.isArray(segments)) return collection
  return segments.reduce((acc, segment) => addTagToCollection(acc, segment), collection)
}

const sanitizeInitialTags = (initialTags) => {
  if (!Array.isArray(initialTags)) return []
  return addSegmentsToCollection([], initialTags)
}

export default function useTagInputController(initialTags = []) {
  const [tags, setTags] = useState(() => sanitizeInitialTags(initialTags))
  const [inputValue, setInputValue] = useState('')

  const replaceTags = useCallback((nextTags = []) => {
    setTags(sanitizeInitialTags(nextTags))
    setInputValue('')
  }, [])

  const handleCommaValue = useCallback((value) => {
    const segments = value.split(',')
    const pending = segments.pop() ?? ''
    setTags(prev => addSegmentsToCollection(prev, segments))
    setInputValue(pending)
  }, [])

  const onInputChange = useCallback((event) => {
    const value = event.target.value
    if (value.includes(',')) {
      handleCommaValue(value)
    } else {
      setInputValue(value)
    }
  }, [handleCommaValue])

  const commitPendingInput = useCallback(() => {
    if (!inputValue.trim()) return
    setTags(prev => addSegmentsToCollection(prev, [inputValue]))
    setInputValue('')
  }, [inputValue])

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitPendingInput()
      return true
    }

    if (event.key === 'Tab') {
      commitPendingInput()
      return false
    }

    const isInputEmpty = inputValue.trim().length === 0
    if ((event.key === 'Backspace' || event.key === 'Delete') && isInputEmpty) {
      let restored = ''
      setTags(prev => {
        if (prev.length === 0) return prev
        const updated = prev.slice(0, -1)
        restored = prev[prev.length - 1]
        return updated
      })
      if (restored) {
        event.preventDefault()
        setInputValue(restored)
        return true
      }
    }

    return false
  }, [commitPendingInput, inputValue.length])

  const onPaste = useCallback((event) => {
    const text = event.clipboardData?.getData('text') || ''
    if (!text.includes(',')) return false
    event.preventDefault()
    setTags(prev => addSegmentsToCollection(prev, text.split(',')))
    setInputValue('')
    return true
  }, [])

  const removeTagAtIndex = useCallback((index) => {
    setTags(prev => prev.filter((_, idx) => idx !== index))
  }, [])

  const clear = useCallback(() => {
    replaceTags([])
  }, [replaceTags])

  const getSnapshot = useCallback(() => {
    return addSegmentsToCollection(tags, inputValue ? [inputValue] : [])
  }, [tags, inputValue])

  return {
    tags,
    inputValue,
    onInputChange,
    onKeyDown,
    onPaste,
    replaceTags,
    clear,
    getSnapshot,
    removeTagAtIndex,
    commitPendingInput
  }
}
