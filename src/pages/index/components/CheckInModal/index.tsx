import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { SelectedOrder } from '../../../../hooks/useOrderAuth'
import './index.scss'

interface Order {
  orderId: string
  roomNumber: string
  checkInDate: string
  checkOutDate: string
}

interface CheckInModalProps {
  visible: boolean
  onClose: () => void
  onSelectOrder: (order: Order) => void
}

type Step = 'loading' | 'phone' | 'orders'

function CheckInModal({ visible, onClose, onSelectOrder }: CheckInModalProps) {
  const [step, setStep] = useState<Step>('loading')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 打开弹窗时检查是否已有验证过的手机号
  useEffect(() => {
    if (visible) {
      const verifiedPhone = Taro.getStorageSync('verifiedPhone')
      if (verifiedPhone) {
        // 已有手机号，直接查询订单
        setPhone(verifiedPhone)
        fetchOrders(verifiedPhone)
      } else {
        // 没有手机号，显示输入表单
        setStep('phone')
      }
    } else {
      // 关闭时重置
      setStep('loading')
      setPhone('')
      setCode('')
      setOrders([])
    }
  }, [visible])

  // 查询订单
  const fetchOrders = async (phoneNum: string) => {
    setLoading(true)
    try {
      // TODO: 调用后端 API 获取订单
      // const result = await api.getOrders(phoneNum)

      // 模拟数据
      const mockOrders: Order[] = [
        {
          orderId: 'order_001',
          roomNumber: '301',
          checkInDate: '2026-03-09',
          checkOutDate: '2026-03-11',
        },
        {
          orderId: 'order_002',
          roomNumber: '502',
          checkInDate: '2026-03-09',
          checkOutDate: '2026-03-10',
        },
      ]

      if (mockOrders.length === 0) {
        Taro.showToast({ title: '该手机号今日无待办理订单', icon: 'none' })
        setStep('phone')
        return
      }

      setOrders(mockOrders)
      setStep('orders')
    } catch {
      Taro.showToast({ title: '查询失败，请重试', icon: 'none' })
      setStep('phone')
    } finally {
      setLoading(false)
    }
  }

  // 发送验证码
  const handleSendCode = useCallback(async () => {
    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入11位手机号', icon: 'none' })
      return
    }
    if (countdown > 0) return

    try {
      // TODO: 调用后端 API 发送验证码
      // await api.sendSmsCode(phone)
      setCountdown(60)
      Taro.showToast({ title: '验证码已发送', icon: 'success' })
    } catch {
      Taro.showToast({ title: '发送失败，请重试', icon: 'none' })
    }
  }, [phone, countdown])

  // 验证并查询订单
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
      // TODO: 调用后端 API 验证验证码
      // await api.verifySmsCode(phone, code)

      // 验证通过，存储手机号
      Taro.setStorageSync('verifiedPhone', phone)

      // 查询订单
      await fetchOrders(phone)
    } catch {
      Taro.showToast({ title: '验证失败，请重试', icon: 'none' })
      setLoading(false)
    }
  }, [phone, code])

  // 选择订单
  const handleSelectOrder = (order: Order) => {
    // 存储选中的订单
    const selectedOrder: SelectedOrder = {
      orderId: order.orderId,
      roomNumber: order.roomNumber,
      checkInDate: order.checkInDate,
      checkOutDate: order.checkOutDate,
    }
    Taro.setStorageSync('selectedOrder', selectedOrder)
    onSelectOrder(order)
  }

  // 更换手机号
  const handleChangePhone = () => {
    Taro.removeStorageSync('verifiedPhone')
    setPhone('')
    setCode('')
    setStep('phone')
    setOrders([])
  }

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  if (!visible) return null

  return (
    <View className="modal-overlay" onClick={onClose}>
      <View className="modal-content" onClick={(e) => e.stopPropagation()}>
        <View className="modal-header">
          <Text className="modal-title">
            {step === 'loading' ? '加载中' : step === 'phone' ? '验证手机号' : '选择订单'}
          </Text>
          <View className="modal-close" onClick={onClose}>×</View>
        </View>

        {step === 'loading' ? (
          <View className="step-loading">
            <Text>正在查询订单...</Text>
          </View>
        ) : step === 'phone' ? (
          <View className="step-phone">
            <View className="form-group">
              <Text className="form-label">手机号</Text>
              <Input
                className="form-input"
                type="number"
                placeholder="请输入预订时填写的手机号"
                maxlength={11}
                value={phone}
                onInput={(e) => setPhone(e.detail.value)}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">验证码</Text>
              <View className="code-row">
                <Input
                  className="form-input code-input"
                  type="number"
                  placeholder="请输入验证码"
                  maxlength={6}
                  value={code}
                  onInput={(e) => setCode(e.detail.value)}
                />
                <View
                  className={`code-btn ${countdown > 0 ? 'disabled' : ''}`}
                  onClick={handleSendCode}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </View>
              </View>
            </View>

            <View
              className={`submit-btn ${loading ? 'loading' : ''}`}
              onClick={handleVerify}
            >
              {loading ? '验证中...' : '下一步'}
            </View>
          </View>
        ) : (
          <View className="step-orders">
            <View className="back-link" onClick={handleChangePhone}>
              ← 更换手机号
            </View>

            <View className="orders-list">
              {orders.map((order) => (
                <View
                  key={order.orderId}
                  className="order-card"
                  onClick={() => handleSelectOrder(order)}
                >
                  <View className="order-room">{order.roomNumber}室</View>
                  <View className="order-date">
                    {formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default CheckInModal
