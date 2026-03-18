import { useState, useEffect, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../../components/Input'
import { useAppStore } from '../../stores/useAppStore'
import { usePhoneStep } from './usePhoneStep'
import { useOrdersStep } from './useOrdersStep'
import { useDepositStep } from './useDepositStep'

export type Step = 'loading' | 'phone' | 'orders' | 'deposit' | 'success'

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
  const checkinRecord = useAppStore((state) => state.checkinRecord)

  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState<Step>('loading')

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  // 子 hooks
  const phone = usePhoneStep({
    onVerified: () => setStep('orders'),
  })

  const orders = useOrdersStep({
    onResult: (result) => {
      if (result === 'no_record') {
        // 由 onNavigateCheckin 处理
      } else if (result === 'pending_deposit') {
        setStep('deposit')
      } else {
        setStep('success')
      }
    },
    onNavigateCheckin: () => {
      close()
      onNavigate('checkin')
    },
  })

  const deposit = useDepositStep({
    onSuccess: () => setStep('success'),
  })

  // checkin 提交成功后自动弹押金弹窗
  useEffect(() => {
    if (checkinRecord && !checkinRecord.depositPaid && !visible) {
      setStep('deposit')
      setVisible(true)
    }
  }, [checkinRecord])

  // 打开时决定初始 step
  useEffect(() => {
    if (visible) {
      if (step !== 'deposit' && step !== 'success') {
        const { userPhone: currentPhone, orders: cachedOrders } = useAppStore.getState()
        if (currentPhone) {
          phone.setPhone(currentPhone)
          if (cachedOrders !== null) {
            setStep('orders')
          } else {
            orders.fetchOrders(currentPhone)
            setStep('orders')
          }
        } else {
          setStep('phone')
        }
      }
    } else {
      setStep('loading')
      phone.reset()
    }
  }, [visible])

  // 换手机号
  const handleChangePhone = () => {
    phone.reset()
    orders.clearOrders()
    setStep('phone')
  }

  // title
  const titleMap: Record<Step, string> = {
    loading: '加载中',
    phone: '验证手机号',
    orders: '选择订单',
    deposit: t('deposit.title', '押金支付'),
    success: t('success.title', '入住成功'),
  }

  // headerRight
  const headerRight = step === 'orders' ? (
    <span className="refresh-btn" onClick={() => {
      const { userPhone } = useAppStore.getState()
      if (userPhone) orders.fetchOrders(userPhone)
    }}>↻</span>
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
          value={phone.phone}
          onChange={phone.setPhone}
        />
        <Input
          label="验证码"
          type="number"
          placeholder="请输入验证码"
          maxLength={6}
          value={phone.code}
          onChange={phone.setCode}
          suffix={
            <div
              className={`code-btn ${phone.countdown > 0 ? 'disabled' : ''}`}
              onClick={phone.sendCode}
            >
              {phone.countdown > 0 ? `${phone.countdown}s` : '获取验证码'}
            </div>
          }
        />
        <div
          className={`btn-primary ${phone.loading ? 'loading' : ''}`}
          onClick={phone.verify}
        >
          {phone.loading ? '验证中...' : '下一步'}
        </div>
      </div>
    )
  }

  if (step === 'orders') {
    content = (
      <div className="step-orders">
        {!orders.orders || orders.orders.length === 0 ? (
          <div className="step-loading">
            <span>今日暂无待办理订单</span>
          </div>
        ) : (
          <div className="orders-list">
            {orders.orders.map((order) => (
              <div
                key={order.orderId}
                className="order-card"
                onClick={() => orders.selectOrder(order)}
              >
                <div className="order-room">{order.roomName}</div>
                <div className="order-date">
                  {orders.formatDate(order.checkInDate)} - {orders.formatDate(order.checkOutDate)}
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

  if (step === 'deposit' && deposit.selectedOrder) {
    content = (
      <div className="step-deposit">
        <div className="deposit-info">
          <div className="deposit-row">
            <span className="deposit-label">{t('deposit.room', '房间')}</span>
            <span className="deposit-value">{deposit.selectedOrder.roomName}</span>
          </div>
          <div className="deposit-row">
            <span className="deposit-label">{t('deposit.checkIn', '入住')}</span>
            <span className="deposit-value">{deposit.selectedOrder.checkInDate}</span>
          </div>
          <div className="deposit-row">
            <span className="deposit-label">{t('deposit.checkOut', '退房')}</span>
            <span className="deposit-value">{deposit.selectedOrder.checkOutDate}</span>
          </div>
        </div>

        <div className="deposit-amount-section">
          <div className="deposit-amount-label">{t('deposit.amount', '押金金额')}</div>
          <div className="deposit-amount">
            <span className="deposit-currency">¥</span>
            <span className="deposit-number">{deposit.depositAmount.toFixed(2)}</span>
          </div>
        </div>

        <div
          className={`btn-primary deposit-pay-btn ${deposit.paying ? 'loading' : ''}`}
          onClick={deposit.paying ? undefined : deposit.payAlipay}
        >
          {deposit.paying ? t('deposit.paying', '支付中...') : t('deposit.pay', '支付宝支付')}
        </div>

        <div
          className={`btn-secondary deposit-wechat-btn ${deposit.paying ? 'loading' : ''}`}
          onClick={deposit.paying ? undefined : deposit.payWechat}
        >
          {t('deposit.wechatPay', '微信支付')}
        </div>

        <div className="deposit-tip">
          {t('deposit.tip', '押金将在退房后原路退回')}
        </div>
      </div>
    )
  }

  if (step === 'success') {
    content = (
      <div className="step-success">
        <div className="success-icon">✓</div>
        <div className="success-message">{t('success.message', '祝您入住愉快')}</div>
        <div className="success-hint">{t('success.hint', 'WiFi密码与房间密码请在主页查看')}</div>
        <div className="btn-primary" onClick={close}>
          {t('success.confirm', '我知道了')}
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
