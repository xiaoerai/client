import { useTranslation } from 'react-i18next'
import Icon from '../../../../components/Icon'
import './index.scss'

export interface Feature {
  id: string
  icon: string
}

interface FeatureGridProps {
  features: Feature[]
  onFeatureClick?: (id: string) => void
}

export default function FeatureGrid({ features, onFeatureClick }: FeatureGridProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="section-header">
        <span className="section-title">{t('home.services')}</span>
        <div className="section-line" />
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="feature-card"
            onClick={() => onFeatureClick?.(feature.id)}
          >
            <Icon name={feature.icon} size={20} color="#a08c6a" className="feature-icon" />
            <span className="feature-title">{t(`features.${feature.id}`)}</span>
            <span className="feature-subtitle">{t(`features.${feature.id}Sub`)}</span>
          </div>
        ))}
      </div>
    </>
  )
}
