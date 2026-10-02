import { useEffect } from 'react'

// Pressing "/" anywhere on the page focuses the search field, unless you're already typing somewhere.
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

      event.preventDefault() // stops the "/" from landing in the field
      input.focus()
      input.select()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [inputRef])
}
