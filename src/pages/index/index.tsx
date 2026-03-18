import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Taro from '@tarojs/taro'
// 页面私有组件
import Hero from './components/Hero'
import StayCard from './components/StayCard'
import FeatureGrid from './components/FeatureGrid'
import CheckInModal from './components/CheckInModal'
import DepositModal from '../checkin/components/DepositModal'
// 公共组件
import TabBar from '../../components/TabBar'
// Store & Hooks & Config
import { useAppStore } from '../../stores/useAppStore'
import { useNavigate } from '../../hooks/useNavigate'
import { getCheckIn } from '../../api'
import { SelectedOrder } from '../../hooks/useOrderAuth'
import { features } from '../../config/features'
import './index.scss'

function Index() {
  // 首页无需路由保护，任何人可访问
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('home')
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [depositOrder, setDepositOrder] = useState<SelectedOrder | null>(null)
  const [paying, setPaying] = useState(false)
  const { navigateTo, makeCall } = useNavigate()
  const { currentStay, hotelConfig, setCurrentStay } = useAppStore()

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
      checkin: () => setShowCheckInModal(true), // 打开弹窗
      orders: () => navigateTo('orders'),
      guide: () => navigateTo('guide'),
      service: () => navigateTo('service'),
      help: () => navigateTo('help'),
      contact: () => makeCall(hotelConfig.phone),
    }

    routeMap[id]?.()
  }

  const handleSelectOrder = async (order: any) => {
    setShowCheckInModal(false)

    // 查询该订单的入住状态，决定跳哪个页面
    const record = await getCheckIn(order.orderId)

    if (!record) {
      // 没有入住记录 → 填表单
      navigateTo('checkin')
    } else if (!record.depositPaid) {
      // 已入住未付押金 → 弹押金弹窗
      setDepositOrder({
        orderId: order.orderId,
        roomName: order.roomName,
        checkInDate: order.checkInDate,
        checkOutDate: order.checkOutDate,
      })
      setShowDeposit(true)
    } else {
      // 已付押金 → 成功页
      navigateTo('success')
    }
  }

  const handleShowPassword = () => {
    navigateTo('success')
  }

  // TODO: 押金金额后续从后端获取
  const depositAmount = 500

  const handlePay = async () => {
    setPaying(true)
    try {
      // TODO: 调用后端创建支付订单
      Taro.redirectTo({ url: '/pages/success/index' })
    } catch {
      Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
    } finally {
      setPaying(false)
    }
  }

  const handleWechatPay = () => {
    Taro.showToast({ title: '暂未开放', icon: 'none' })
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

      <CheckInModal
        visible={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSelectOrder={handleSelectOrder}
      />

      <DepositModal
        visible={showDeposit}
        roomName={depositOrder?.roomName || ''}
        checkInDate={depositOrder?.checkInDate || ''}
        checkOutDate={depositOrder?.checkOutDate || ''}
        depositAmount={depositAmount}
        paying={paying}
        onPay={handlePay}
        onWechatPay={handleWechatPay}
        onClose={() => setShowDeposit(false)}
      />
    </div>
  )
}

export default Index
