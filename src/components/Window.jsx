import { useEffect, useRef, useState } from 'react'

// A draggable macOS-style window. Traffic lights work: red closes, yellow
// minimizes (hidden but kept mounted so app state survives), green toggles
// maximize. Drag the title bar to move; double-click it to maximize/restore.
export default function Window({
  title,
  z,
  initialX,
  initialY,
  width = 460,
  height = 320,
  minimized,
  maximized,
  onClose,
  onMinimize,
  onMaximize,
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
    if (maximized) return
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
  }

  const style = maximized
    ? { zIndex: z }
    : { left: pos.x, top: pos.y, width, height, zIndex: z }

  return (
    <div
      className={`win${maximized ? ' win--max' : ''}`}
      style={{ ...style, display: minimized ? 'none' : 'flex' }}
      onPointerDown={onFocus}
    >
      <div className="win__bar" onPointerDown={startDrag} onDoubleClick={onMaximize}>
        <div className="win__lights" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="win__light win__light--close"
            onClick={onClose}
            aria-label="Close window"
          />
          <button
            type="button"
            className="win__light win__light--min"
            onClick={onMinimize}
            aria-label="Minimize window"
          />
          <button
            type="button"
            className="win__light win__light--max"
            onClick={onMaximize}
            aria-label="Maximize window"
          />
        </div>
        <span className="win__title">{title}</span>
      </div>
      <div className="win__body">{children}</div>
    </div>
  )
}
