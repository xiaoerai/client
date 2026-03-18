import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../../../components/Modal'
import './index.scss'

interface DepositModalProps {
  visible: boolean
  roomName: string
  checkInDate: string
  checkOutDate: string
  depositAmount: number // 元
  paying: boolean
  onPay: () => void
  onWechatPay: () => void
  onClose: () => void
}

function DepositModal({
  visible,
  roomName,
  checkInDate,
  checkOutDate,
  depositAmount,
  paying,
  onPay,
  onWechatPay,
  onClose,
}: DepositModalProps) {
  const { t } = useTranslation()
  const [showMore, setShowMore] = useState(false)

  return (
    <Modal visible={visible} title={t('deposit.title', '押金支付')} onClose={onClose}>
      <div className="deposit-info">
        <div className="deposit-row">
          <span className="deposit-label">{t('deposit.room', '房间')}</span>
          <span className="deposit-value">{roomName}</span>
        </div>
        <div className="deposit-row">
          <span className="deposit-label">{t('deposit.checkIn', '入住')}</span>
          <span className="deposit-value">{checkInDate}</span>
        </div>
        <div className="deposit-row">
          <span className="deposit-label">{t('deposit.checkOut', '退房')}</span>
          <span className="deposit-value">{checkOutDate}</span>
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
        onClick={paying ? undefined : onPay}
      >
        {paying ? t('deposit.paying', '支付中...') : t('deposit.pay', '支付宝支付')}
      </div>

      {!showMore ? (
        <div className="deposit-more-toggle" onClick={() => setShowMore(true)}>
          {t('deposit.morePay', '更多支付方式')} ▾
        </div>
      ) : (
        <div className="deposit-more-methods">
          <div
            className={`btn-secondary deposit-wechat-btn ${paying ? 'loading' : ''}`}
            onClick={paying ? undefined : onWechatPay}
          >
            {t('deposit.wechatPay', '微信支付')}
          </div>
        </div>
      )}

      <div className="deposit-tip">
        {t('deposit.tip', '押金将在退房后原路退回')}
      </div>
    </Modal>
  )
}

export default DepositModal
