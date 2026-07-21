import { useEffect, useRef } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onDelete: () => void
  onRename: () => void
  onTogglePin: () => void
  isPinned: boolean
}

export function ContextMenu({
  x,
  y,
  onClose,
  onDelete,
  onRename,
  onTogglePin,
  isPinned,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-card/90 backdrop-blur-md p-1.5 text-card-foreground shadow-xl transition-all duration-200 animate-in fade-in-50 zoom-in-95"
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin()
          onClose()
        }}
        className="flex w-full cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {isPinned ? '📌 Unpin Session' : '📌 Pin Session'}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRename()
          onClose()
        }}
        className="flex w-full cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        ✏️ Rename Session
      </button>
      <div className="my-1.5 h-px bg-border/65" />
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
          onClose()
        }}
        className="flex w-full cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-semibold text-destructive outline-none transition-colors hover:bg-destructive/15 hover:text-destructive"
      >
        🗑️ Delete Session
      </button>
    </div>
  )
}
export default ContextMenu
