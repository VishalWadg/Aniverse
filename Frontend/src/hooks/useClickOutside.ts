import { useEffect, useRef } from 'react'

export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  enabled = true,
  ignoreSelector = '[data-click-outside-ignore="true"]',
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) return

      const eventPath = event.composedPath?.() ?? []
      const clickedInside =
        eventPath.includes(ref.current as EventTarget) || ref.current?.contains(target)
      const clickedOnIgnoredElement = eventPath.some((node) => {
        if (!(node instanceof Element)) return false

        return node.matches(ignoreSelector) || node.closest(ignoreSelector) !== null
      })

      if (clickedInside || clickedOnIgnoredElement) {
        return
      }

      handler()
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [enabled, handler, ignoreSelector])

  return ref
}
