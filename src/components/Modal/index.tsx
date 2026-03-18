import { ReactNode } from 'react'
import './index.scss'

interface ModalProps {
  visible: boolean
  title: string
  onClose: () => void
  children: ReactNode
  headerRight?: ReactNode
}

function Modal({ visible, title, onClose, children, headerRight }: ModalProps) {
  if (!visible) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
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
