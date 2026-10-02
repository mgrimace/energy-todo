import { useEffect } from 'react'

const readColor = (probe, value) => {
  probe.style.backgroundColor = value
  return getComputedStyle(probe).backgroundColor
}

const compositeToHex = (base, overlay) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.fillStyle = base
  context.fillRect(0, 0, 1, 1)
  context.fillStyle = overlay
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
}

const setThemeColor = color => {
  let metas = Array.from(document.querySelectorAll('meta[name="theme-color"]'))
  if (metas.length === 0) {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
    metas = [meta]
  }
  metas.forEach(meta => meta.setAttribute('content', color))
}

export default function useStatusBarTint() {
  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    let lastColor = ''

    const apply = () => {
      frame = 0

      const probe = document.createElement('div')
      probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
      document.body.appendChild(probe)
      const base = readColor(probe, 'var(--color-bg)')
      const tint = readColor(probe, 'var(--tint-via)')
      probe.remove()

      const color = compositeToHex(base, tint)
      if (color === lastColor) return
      lastColor = color
      setThemeColor(color)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }

    schedule()
    const observer = new MutationObserver(schedule)
    observer.observe(root, { attributes: true })

    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
}
