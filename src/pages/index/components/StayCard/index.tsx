import { useTranslation } from 'react-i18next'
import { StayInfo } from '../../../../stores/useAppStore'
import './index.scss'

interface StayCardProps {
  stay: StayInfo
  onShowPassword?: () => void
  onShowDetail?: () => void
}

export default function StayCard({ stay, onShowPassword, onShowDetail }: StayCardProps) {
  const { t } = useTranslation()

  return (
    <div className="stay-card">
      <div className="stay-header">
        <span className="stay-label">{t('home.currentStay')}</span>
        {stay.isCheckedIn && <span className="stay-badge">{t('home.stayingNow')}</span>}
      </div>
      <span className="stay-room">{stay.roomName}</span>
      <span className="stay-date">
        {stay.dateRange} · {stay.nights} nights
      </span>
      <div className="stay-actions">
        <div className="btn-secondary" onClick={onShowDetail}>
          <span className="btn-text">{t('home.details')}</span>
        </div>
        <div className="btn-primary" onClick={onShowPassword}>
          <span className="btn-text-dark">{t('home.doorPassword')}</span>
        </div>
      </div>
    </div>
  )
}
