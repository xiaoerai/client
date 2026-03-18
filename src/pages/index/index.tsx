import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
// 页面私有组件
import Hero from './components/Hero'
import StayCard from './components/StayCard'
import FeatureGrid from './components/FeatureGrid'
// 公共组件
import TabBar from '../../components/TabBar'
import Modal from '../../components/Modal'
// Store & Hooks & Config
import { useAppStore } from '../../stores/useAppStore'
import { useNavigate } from '../../hooks/useNavigate'
import { useCheckinFlow } from '../../hooks/useCheckinFlow'
import { features } from '../../config/features'
import './index.scss'

function Index() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('home')
  const { navigateTo, makeCall } = useNavigate()
  const { currentStay, hotelConfig, setCurrentStay } = useAppStore()

  const flow = useCheckinFlow((target) => navigateTo(target))

  // 模拟加载入住数据
  useEffect(() => {
    // TODO: 从 API 获取真实数据
    setCurrentStay({
      roomName: '温馨大床房',
      dateRange: '3.08 - 3.10',
      nights: 2,
      isCheckedIn: true,
    })
  }, [setCurrentStay])

  const handleFeatureClick = (id: string) => {
    const routeMap: Record<string, () => void> = {
      checkin: () => flow.open(),
      orders: () => navigateTo('orders'),
      guide: () => navigateTo('guide'),
      service: () => navigateTo('service'),
      help: () => navigateTo('help'),
      contact: () => makeCall(hotelConfig.phone),
    }

    routeMap[id]?.()
  }

  const handleShowPassword = () => {
    navigateTo('success')
  }

  return (
    <div className="page">
      <Hero
        title={hotelConfig.name}
        subtitle={hotelConfig.subtitle}
        imageUrl={hotelConfig.heroImage}
      />

      <div className="main-content">
        {currentStay && (
          <StayCard
            stay={currentStay}
            onShowPassword={handleShowPassword}
          />
        )}

        <FeatureGrid
          features={features}
          onFeatureClick={handleFeatureClick}
        />

        <div className="quick-info">
          <div className="info-item">
            <span className="info-label">{t('home.checkIn')}</span>
            <span className="info-value">{hotelConfig.checkInTime}</span>
          </div>
          <div className="info-divider" />
          <div className="info-item">
            <span className="info-label">{t('home.checkOut')}</span>
            <span className="info-value">{hotelConfig.checkOutTime}</span>
          </div>
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <Modal
        visible={flow.visible}
        title={flow.title}
        headerRight={flow.headerRight}
        contentKey={flow.contentKey}
        onClose={flow.close}
      >
        {flow.content}
      </Modal>
    </div>
  )
}

export default Index
