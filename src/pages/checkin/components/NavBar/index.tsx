import Icon from '../../../../components/Icon'
import './index.scss'

interface NavBarProps {
  title: string
  onBack: () => void
}

export default function NavBar({ title, onBack }: NavBarProps) {
  return (
    <div className="nav-bar">
      <div className="nav-back" onClick={onBack}>
        <Icon name="arrow-left" size={20} />
      </div>
      <span className="nav-title">{title}</span>
      <div className="nav-placeholder" />
    </div>
  )
}
