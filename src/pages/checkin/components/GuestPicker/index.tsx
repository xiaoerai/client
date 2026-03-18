import { useState, useRef } from 'react'
import type { CachedGuest } from '../../../../api'
import './index.scss'

interface GuestPickerProps {
  guests: CachedGuest[]
  selectedIdx: number | null
  onSelect: (idx: number | null) => void
  onRemove: (idx: number) => void
}

export default function GuestPicker({ guests, selectedIdx, onSelect, onRemove }: GuestPickerProps) {
  const [editing, setEditing] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setEditing(true)
    }, 600)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleRemove = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation()
    onRemove(idx)
    // 没有住客了就退出编辑模式
    if (guests.length <= 1) {
      setEditing(false)
    }
  }

  const handleClickOutside = () => {
    if (editing) {
      setEditing(false)
    }
  }

  if (guests.length === 0) return null

  return (
    <div className="guest-picker" onClick={handleClickOutside}>
      {guests.map((g, idx) => (
        <div
          key={g.idNumber}
          className={`guest-tag ${selectedIdx === idx ? 'active' : ''} ${editing ? 'wobble' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            if (!editing) onSelect(idx)
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {g.name}
          {editing && (
            <span className="guest-tag-remove" onClick={(e) => handleRemove(e, idx)}>×</span>
          )}
        </div>
      ))}
      {!editing && (
        <div
          className={`guest-tag ${selectedIdx === null ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(null)
          }}
        >
          + 新住客
        </div>
      )}
    </div>
  )
}
