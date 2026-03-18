import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Taro from '@tarojs/taro'
import { checkinFormSchema, CheckinFormData } from '../../utils/schemas'
import { recognizeIdCard } from '../../utils/ocr'
import { useOrderAuth, useSelectedOrder } from '../../hooks/useOrderAuth'
import { useAppStore } from '../../stores/useAppStore'
import { createCheckIn } from '../../api'
import NavBar from './components/NavBar'
import FormSection from './components/FormSection'
import UploadSection from './components/UploadSection'
import DepositModal from './components/DepositModal'
import './index.scss'

function Checkin() {
  useOrderAuth() // 路由保护：需要已选择订单
  const { t } = useTranslation()
  const selectedOrder = useSelectedOrder()
  const phone = useAppStore((state) => state.userPhone) || ''
  const [submitting, setSubmitting] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState<CheckinFormData>({
    name: '',
    idNumber: '',
  })
  const [idFront, setIdFront] = useState('')
  const [isRecognizing, setIsRecognizing] = useState(false)

  const handleBack = () => {
    Taro.navigateBack()
  }

  const handleFormChange = (field: keyof CheckinFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })
      if (res.tempFilePaths[0]) {
        const imagePath = res.tempFilePaths[0]
        setIdFront(imagePath)

        // OCR 识别
        setIsRecognizing(true)
        try {
          const result = await recognizeIdCard(imagePath)
          if (result) {
            setForm((prev) => ({
              ...prev,
              name: result.name,
              idNumber: result.idNumber,
            }))
            Taro.showToast({ title: '识别成功', icon: 'success' })
          } else {
            Taro.showToast({ title: '请手动填写信息', icon: 'none' })
          }
        } catch {
          Taro.showToast({ title: '请手动填写信息', icon: 'none' })
        } finally {
          setIsRecognizing(false)
        }
      }
    } catch {
      console.log('Choose image cancelled')
    }
  }

  const validateForm = (): boolean => {
    const formResult = checkinFormSchema.safeParse(form)
    if (!formResult.success) {
      const firstError = formResult.error.issues[0]
      Taro.showToast({ title: firstError.message, icon: 'none' })
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    if (!selectedOrder) {
      Taro.showToast({ title: '订单信息丢失', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const result = await createCheckIn({
        orderId: selectedOrder.orderId,
        roomId: selectedOrder.orderId, // 暂用 orderId
        roomName: selectedOrder.roomName,
        phone,
        checkInDate: selectedOrder.checkInDate,
        checkOutDate: selectedOrder.checkOutDate,
        guest: {
          name: form.name,
          idNumber: form.idNumber,
          idImageUrl: idFront || undefined,
        },
      })

      if (result) {
        setShowDeposit(true)
      } else {
        Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  // TODO: 押金金额后续从后端获取
  const depositAmount = 500

  // 支付宝原生支付
  const handlePay = async () => {
    setPaying(true)
    try {
      // TODO: 调用后端创建支付订单，获取支付参数
      // const payParams = await createDeposit({ orderId: selectedOrder!.orderId })
      // await Taro.tradePay({ orderStr: payParams.orderStr })

      // 支付成功，跳转成功页
      Taro.redirectTo({ url: '/pages/success/index' })
    } catch {
      Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
    } finally {
      setPaying(false)
    }
  }

  // 微信支付（通过收钱吧 H5 页面跳转）
  const handleWechatPay = () => {
    // TODO: 调用后端获取收钱吧 H5 微信支付链接
    // const payUrl = await createDepositH5({ orderId: selectedOrder!.orderId, channel: 'wechat' })
    // Taro.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(payUrl)}` })
    Taro.showToast({ title: '暂未开放', icon: 'none' })
  }

  return (
    <div className="checkin-page">
      <NavBar title={t('guestInfo.title')} onBack={handleBack} />

      <UploadSection
        idFront={idFront}
        isRecognizing={isRecognizing}
        onChoose={handleChooseImage}
      />

      <FormSection form={form} onChange={handleFormChange} />

      <div className="bottom-action">
        <div className={`btn-primary ${submitting ? 'loading' : ''}`} onClick={handleSubmit}>
          {submitting ? '提交中...' : t('checkin.nextStep')}
        </div>
      </div>

      <DepositModal
        visible={showDeposit}
        roomName={selectedOrder?.roomName || ''}
        checkInDate={selectedOrder?.checkInDate || ''}
        checkOutDate={selectedOrder?.checkOutDate || ''}
        depositAmount={depositAmount}
        paying={paying}
        onPay={handlePay}
        onWechatPay={handleWechatPay}
        onClose={() => setShowDeposit(false)}
      />
    </div>
  )
}

export default Checkin
