import { useEffect } from 'react'

export default function useSearchShortcut(inputRef) {
  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.isComposing || event.repeat) return

      const target = event.target
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (isTyping) return

      const input = inputRef.current
      if (!input) return

      event.preventDefault()
      input.focus()
      input.select()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [inputRef])
}