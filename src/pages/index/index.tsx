import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Taro from '@tarojs/taro'
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
import { useCheckinFlow } from '../../hooks/checkinFlow'
import { features } from '../../config/features'
import './index.scss'

function Index() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('home')
  const { navigateTo, makeCall } = useNavigate()
  const { checkinRecord, hotelConfig } = useAppStore()

  const flow = useCheckinFlow((target) => navigateTo(target))

  const showStayCard = checkinRecord &&
    (checkinRecord.status === 'checked_in' || checkinRecord.status === 'checkout_pending')

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

  const handleCheckout = () => {
    Taro.showModal({
      title: '确认退房',
      content: '确认要退房吗？押金将在房东确认后退还。',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调后端退房接口
          Taro.showToast({ title: '退房申请已提交', icon: 'success' })
        }
      },
    })
  }

  return (
    <div className="page">
      <Hero
        title={hotelConfig.name}
        subtitle={hotelConfig.subtitle}
        imageUrl={hotelConfig.heroImage}
      />

      <div className="main-content">
        {showStayCard && (
          <StayCard
            record={checkinRecord}
            onShowPassword={handleShowPassword}
            onCheckout={handleCheckout}
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
