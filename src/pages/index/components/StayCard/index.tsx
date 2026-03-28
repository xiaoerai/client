import { useTranslation } from 'react-i18next'
import { CheckinRecord } from '../../../../stores/useAppStore'
import './index.scss'

interface StayCardProps {
  record: CheckinRecord
  onShowPassword?: () => void
  onCheckout?: () => void
}

export default function StayCard({ record, onShowPassword, onCheckout }: StayCardProps) {
  const { t } = useTranslation()

  const isPending = record.status === 'checkout_pending'

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <div className="stay-card">
      <div className="stay-header">
        <span className="stay-label">{t('home.currentStay')}</span>
        {isPending ? (
          <span className="stay-badge stay-badge-pending">待确认退房</span>
        ) : (
          <span className="stay-badge">{t('home.stayingNow')}</span>
        )}
      </div>
      <div className="stay-room-row">
        <span className="stay-room">{record.roomName}</span>
      </div>
      <span className="stay-date">
        {formatDate(record.checkInDate)} - {formatDate(record.checkOutDate)}
      </span>
      <div className="stay-actions">
        <div className="btn-secondary" onClick={onShowPassword}>
          <span className="btn-text">{t('home.doorPassword')}</span>
        </div>
        {!isPending && (
          <div className="btn-primary" onClick={onCheckout}>
            <span className="btn-text-dark">退房</span>
          </div>
        )}
      </div>
    </div>
  )
}
