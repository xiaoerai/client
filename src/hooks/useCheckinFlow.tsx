import { useState, useEffect, useCallback, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Taro from '@tarojs/taro'
import Input from '../components/Input'
import { useAppStore, Order } from '../stores/useAppStore'
import { sendSmsCode, login, getOrders, getCheckIn } from '../api'

type Step = 'loading' | 'phone' | 'orders' | 'deposit'

interface CheckinFlowResult {
  visible: boolean
  title: string
  headerRight?: ReactNode
  content: ReactNode
  contentKey: string
  open: () => void
  close: () => void
}

export function useCheckinFlow(onNavigate: (target: 'checkin' | 'success') => void): CheckinFlowResult {
  const { t } = useTranslation()
  const setUserPhone = useAppStore((state) => state.setUserPhone)
  const orders = useAppStore((state) => state.orders)
  const setOrders = useAppStore((state) => state.setOrders)
  const selectedOrder = useAppStore((state) => state.selectedOrder)
  const setSelectedOrder = useAppStore((state) => state.setSelectedOrder)
  const checkinRecord = useAppStore((state) => state.checkinRecord)
  const setCheckinRecord = useAppStore((state) => state.setCheckinRecord)

  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState<Step>('loading')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const depositAmount = 500 // TODO: 从后端获取

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  // checkin 提交成功后自动弹押金弹窗
  useEffect(() => {
    if (checkinRecord && !checkinRecord.depositPaid && !visible) {
      setStep('deposit')
      setVisible(true)
    }
  }, [checkinRecord])

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 打开时决定初始 step
  useEffect(() => {
    if (visible) {
      const { userPhone: currentPhone, orders: cachedOrders } = useAppStore.getState()
      if (currentPhone) {
        setPhone(currentPhone)
        if (cachedOrders !== null) {
          setStep('orders')
        } else {
          fetchOrders(currentPhone)
        }
      } else {
        setStep('phone')
      }
    } else {
      setStep('loading')
      setPhone('')
      setCode('')
    }
  }, [visible])

  const fetchOrders = async (phoneNum: string) => {
    setLoading(true)
    try {
      const orderList = await getOrders(phoneNum)
      setOrders(orderList)
      setStep('orders')
    } catch {
      Taro.showToast({ title: '查询失败，请重试', icon: 'none' })
      setStep('orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = useCallback(async () => {
    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入11位手机号', icon: 'none' })
      return
    }
    if (countdown > 0) return
    try {
      const success = await sendSmsCode(phone)
      if (success) {
        setCountdown(60)
        Taro.showToast({ title: '验证码已发送', icon: 'none' })
      } else {
        Taro.showToast({ title: '发送失败，请重试', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '发送失败，请重试', icon: 'none' })
    }
  }, [phone, countdown])

  const handleVerify = useCallback(async () => {
    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入11位手机号', icon: 'none' })
      return
    }
    if (code.length < 4) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const token = await login(phone, code)
      if (token) {
        setUserPhone(phone)
        const orderList = await getOrders(phone)
        setOrders(orderList)
        setStep('orders')
      } else {
        Taro.showToast({ title: '验证码错误', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '验证失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [phone, code])

  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder({
      orderId: order.orderId,
      roomName: order.roomName,
      checkInDate: order.checkInDate,
      checkOutDate: order.checkOutDate,
    })

    setStep('loading')
    const record = await getCheckIn(order.orderId)

    if (!record) {
      close()
      onNavigate('checkin')
    } else if (!record.depositPaid) {
      setCheckinRecord(record)
      setStep('deposit')
    } else {
      setCheckinRecord(record)
      close()
      onNavigate('success')
    }
  }

  const handleChangePhone = () => {
    setPhone('')
    setCode('')
    setStep('phone')
    setOrders(null)
  }

  const handlePay = async () => {
    setPaying(true)
    try {
      // TODO: 调用后端创建支付订单
      close()
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  // title
  const titleMap: Record<Step, string> = {
    loading: '加载中',
    phone: '验证手机号',
    orders: '选择订单',
    deposit: t('deposit.title', '押金支付'),
  }

  // headerRight
  const headerRight = step === 'orders' ? (
    <span className="refresh-btn" onClick={() => fetchOrders(phone)}>↻</span>
  ) : undefined

  // content
  let content: ReactNode = null

  if (step === 'loading') {
    content = (
      <div className="step-loading">
        <span>正在查询...</span>
      </div>
    )
  }

  if (step === 'phone') {
    content = (
      <div className="step-phone">
        <Input
          label="手机号"
          type="number"
          placeholder="请输入预订时填写的手机号"
          maxLength={11}
          value={phone}
          onChange={setPhone}
        />
        <Input
          label="验证码"
          type="number"
          placeholder="请输入验证码"
          maxLength={6}
          value={code}
          onChange={setCode}
          suffix={
            <div
              className={`code-btn ${countdown > 0 ? 'disabled' : ''}`}
              onClick={handleSendCode}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </div>
          }
        />
        <div
          className={`btn-primary ${loading ? 'loading' : ''}`}
          onClick={handleVerify}
        >
          {loading ? '验证中...' : '下一步'}
        </div>
      </div>
    )
  }

  if (step === 'orders') {
    content = (
      <div className="step-orders">
        {!orders || orders.length === 0 ? (
          <div className="step-loading">
            <span>今日暂无待办理订单</span>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="order-card"
                onClick={() => handleSelectOrder(order)}
              >
                <div className="order-room">{order.roomName}</div>
                <div className="order-date">
                  {formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="change-phone" onClick={handleChangePhone}>
          更换手机号
        </div>
      </div>
    )
  }

  if (step === 'deposit' && selectedOrder) {
    content = (
      <div className="step-deposit">
        <div className="deposit-info">
          <div className="deposit-row">
            <span className="deposit-label">{t('deposit.room', '房间')}</span>
            <span className="deposit-value">{selectedOrder.roomName}</span>
          </div>
          <div className="deposit-row">
            <span className="deposit-label">{t('deposit.checkIn', '入住')}</span>
            <span className="deposit-value">{selectedOrder.checkInDate}</span>
          </div>
          <div className="deposit-row">
            <span className="deposit-label">{t('deposit.checkOut', '退房')}</span>
            <span className="deposit-value">{selectedOrder.checkOutDate}</span>
          </div>
        </div>

        <div className="deposit-amount-section">
          <div className="deposit-amount-label">{t('deposit.amount', '押金金额')}</div>
          <div className="deposit-amount">
            <span className="deposit-currency">¥</span>
            <span className="deposit-number">{depositAmount.toFixed(2)}</span>
          </div>
        </div>

        <div
          className={`btn-primary deposit-pay-btn ${paying ? 'loading' : ''}`}
          onClick={paying ? undefined : handlePay}
        >
          {paying ? t('deposit.paying', '支付中...') : t('deposit.pay', '支付宝支付')}
        </div>

        <div
          className={`btn-secondary deposit-wechat-btn ${paying ? 'loading' : ''}`}
          onClick={paying ? undefined : handleWechatPay}
        >
          {t('deposit.wechatPay', '微信支付')}
        </div>

        <div className="deposit-tip">
          {t('deposit.tip', '押金将在退房后原路退回')}
        </div>
      </div>
    )
  }

  return {
    visible,
    title: titleMap[step],
    headerRight,
    content,
    contentKey: step,
    open,
    close,
  }
}
