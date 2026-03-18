import { ReactNode, useState, useEffect } from 'react'
import './index.scss'

interface ModalProps {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
  headerRight?: ReactNode
  contentKey?: string
}

function Modal({ visible, title, onClose, children, headerRight, contentKey }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true)
        })
      })
    } else {
      setAnimating(false)
      const timer = setTimeout(() => setMounted(false), 250)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!mounted) return null

  return (
    <div
      className={`modal-overlay ${animating ? 'modal-enter' : 'modal-exit'}`}
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {title}
            {headerRight}
          </div>
          <div className="modal-close" onClick={onClose}>×</div>
        </div>
        <div className="modal-body" key={contentKey}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
