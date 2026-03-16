import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import Input from '../../../../components/Input'
import { SelectedOrder } from '../../../../hooks/useOrderAuth'
import { useAppStore } from '../../../../stores/useAppStore'
import { sendSmsCode, login, getOrders } from '../../../../api'
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
  // 全局状态：已验证的手机号
  const setUserPhone = useAppStore((state) => state.setUserPhone)

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
      // 从 store 获取最新值（不放入依赖，避免验证成功后重复 fetch）
      const currentPhone = useAppStore.getState().userPhone
      if (currentPhone) {
        // 已有手机号，直接查询订单
        setPhone(currentPhone)
        fetchOrders(currentPhone)
      } else {
        // 没有手机号，显示输入表单
        setStep('phone')
      }
    } else {
      // 关闭时重置 UI 状态（不动 store）
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
      const orderList = await getOrders(phoneNum)

      if (orderList.length === 0) {
        Taro.showToast({ title: '该手机号今日无待办理订单', icon: 'none' })
        setStep('phone')
        return
      }

      setOrders(orderList)
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
      const token = await login(phone, code)
      if (token) {
        // 验证通过，更新全局状态（自动持久化到 storage）
        setUserPhone(phone)
        // 登录成功后获取订单列表
        const orderList = await getOrders(phone)
        if (orderList.length === 0) {
          Taro.showToast({ title: '该手机号今日无待办理订单', icon: 'none' })
          setStep('phone')
        } else {
          setOrders(orderList)
          setStep('orders')
        }
      } else {
        Taro.showToast({ title: '验证码错误', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '验证失败，请重试', icon: 'none' })
    } finally {
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

  // 更换手机号（只切换UI，不修改 store，验证成功后才更新）
  const handleChangePhone = () => {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            {step === 'loading' ? '加载中' : step === 'phone' ? '验证手机号' : '选择订单'}
          </span>
          <div className="modal-close" onClick={onClose}>×</div>
        </div>

        {step === 'loading' ? (
          <div className="step-loading">
            <span>正在查询订单...</span>
          </div>
        ) : step === 'phone' ? (
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
        ) : (
          <div className="step-orders">
            <div className="back-link" onClick={handleChangePhone}>
              ← 更换手机号
            </div>

            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.orderId}
                  className="order-card"
                  onClick={() => handleSelectOrder(order)}
                >
                  <div className="order-room">{order.roomNumber}</div>
                  <div className="order-date">
                    {formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckInModal
