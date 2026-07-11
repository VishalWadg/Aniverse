import { useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from 'react'

export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  enabled = true,
  ignoreSelector = '[data-click-outside-ignore="true"]',
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!enabled) return

    const handlePointerDown = (event: Event) => {
      const target = event.target

      if (!(target instanceof Node)) return

      const clickedInside = ref.current?.contains(target)
      const clickedOnIgnoredElement =
        target instanceof Element && target.closest(ignoreSelector)

      if (clickedInside || clickedOnIgnoredElement) {
        return
      }

      handler()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchend', handlePointerDown)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchend', handlePointerDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [enabled, handler, ignoreSelector])

  const stopPropagation = (event: { stopPropagation: () => void }) => event.stopPropagation()

  return {
    ref,
    onMouseDown: stopPropagation as (event: ReactMouseEvent<HTMLElement>) => void,
    onMouseUp: stopPropagation as (event: ReactMouseEvent<HTMLElement>) => void,
    onTouchStart: stopPropagation as (event: ReactTouchEvent<HTMLElement>) => void,
    onTouchEnd: stopPropagation as (event: ReactTouchEvent<HTMLElement>) => void,
    onTouchCancel: stopPropagation as (event: ReactTouchEvent<HTMLElement>) => void,
    onPointerDown: stopPropagation as (event: ReactPointerEvent<HTMLElement>) => void,
    onPointerUp: stopPropagation as (event: ReactPointerEvent<HTMLElement>) => void,
  }
}
