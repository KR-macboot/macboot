import { useEffect, useRef, useState } from 'react'

// A draggable macOS-style window: traffic-light controls + a title bar you grab to
// move it, and a body that holds the app. Clicking anywhere focuses (raises) it.
export default function Window({
  title,
  z,
  initialX,
  initialY,
  width = 460,
  height = 320,
  onClose,
  onFocus,
  children,
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const drag = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      if (!drag.current) return
      setPos({
        x: drag.current.ox + (e.clientX - drag.current.sx),
        y: Math.max(28, drag.current.oy + (e.clientY - drag.current.sy)),
      })
    }
    const onUp = () => {
      drag.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  const startDrag = (e) => {
    onFocus()
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
  }

  return (
    <div
      className="win"
      style={{ left: pos.x, top: pos.y, zIndex: z, width, height }}
      onPointerDown={onFocus}
    >
      <div className="win__bar" onPointerDown={startDrag}>
        <div className="win__lights" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="win__light win__light--close"
            onClick={onClose}
            aria-label="Close window"
          />
          <span className="win__light win__light--min" aria-hidden="true" />
          <span className="win__light win__light--max" aria-hidden="true" />
        </div>
        <span className="win__title">{title}</span>
      </div>
      <div className="win__body">{children}</div>
    </div>
  )
}
