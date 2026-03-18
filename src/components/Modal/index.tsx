import { ReactNode, useState, useEffect } from 'react'
import './index.scss'

interface ModalProps {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
  headerRight?: ReactNode
}

function Modal({ visible, title, onClose, children, headerRight }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (visible) {
      setMounted(true)
      // 下一帧再加动画 class，确保 DOM 已渲染
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true)
        })
      })
    } else {
      setAnimating(false)
      // 等动画结束再卸载 DOM
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
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
