import { useTranslation } from 'react-i18next'
import Icon from '../Icon'
import './index.scss'

interface Tab {
  id: string
  icon: string
}

interface TabBarProps {
  tabs?: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
}

const defaultTabs: Tab[] = [
  { id: 'home', icon: 'home' },
  { id: 'myStay', icon: 'calendar' },
  { id: 'profile', icon: 'user' },
]

export default function TabBar({
  tabs = defaultTabs,
  activeTab,
  onTabChange
}: TabBarProps) {
  const { t } = useTranslation()

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <Icon name={tab.icon} size={22} />
          <span className="tab-label">{t(`tabBar.${tab.id}`)}</span>
        </div>
      ))}
    </div>
  )
}
