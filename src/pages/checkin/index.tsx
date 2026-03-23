import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Taro from '@tarojs/taro'
import { checkinFormSchema, CheckinFormData } from '../../utils/schemas'
import { recognizeIdCard } from '../../utils/ocr'
import { useOrderAuth } from '../../hooks/useOrderAuth'
import { useAppStore } from '../../stores/useAppStore'
import { createCheckIn, getMyGuests, removeMyGuest } from '../../api'
import type { CachedGuest } from '../../api'
import NavBar from './components/NavBar'
import FormSection from './components/FormSection'
import UploadSection from './components/UploadSection'
import GuestPicker from './components/GuestPicker'
import './index.scss'

function Checkin() {
  useOrderAuth() // 路由保护：需要已选择订单
  const { t } = useTranslation()
  const selectedOrder = useAppStore((state) => state.selectedOrder)
  const setCheckinRecord = useAppStore((state) => state.setCheckinRecord)
  const phone = useAppStore((state) => state.userPhone) || ''
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CheckinFormData>({
    name: '',
    idNumber: '',
  })
  const [idFront, setIdFront] = useState('')
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [guests, setGuests] = useState<CachedGuest[]>([])
  const [selectedGuestIdx, setSelectedGuestIdx] = useState<number | null>(null)

  // 加载历史住客
  useEffect(() => {
    if (!phone) return
    getMyGuests(phone).then((list) => {
      if (list.length > 0) {
        setGuests(list)
        setSelectedGuestIdx(0)
        setForm({ name: list[0].name, idNumber: list[0].idNumber })
      }
    }).catch(() => {})
  }, [phone])

  const handleSelectGuest = (idx: number | null) => {
    setSelectedGuestIdx(idx)
    if (idx !== null && guests[idx]) {
      setForm({ name: guests[idx].name, idNumber: guests[idx].idNumber })
    } else {
      setForm({ name: '', idNumber: '' })
    }
  }

  const handleRemoveGuest = (idx: number) => {
    const guest = guests[idx]
    // 先更新 UI，后端异步处理
    const updated = guests.filter((_, i) => i !== idx)
    setGuests(updated)
    if (selectedGuestIdx === idx) {
      handleSelectGuest(updated.length > 0 ? 0 : null)
    } else if (selectedGuestIdx !== null && selectedGuestIdx > idx) {
      setSelectedGuestIdx(selectedGuestIdx - 1)
    }
    removeMyGuest(phone, guest.idNumber).catch(() => {})
  }

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
        // 存入全局状态，首页检测到后自动弹押金弹窗
        setCheckinRecord(result)
        Taro.navigateBack()
      } else {
        Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="checkin-page">
      <NavBar title={t('guestInfo.title')} onBack={handleBack} />

      <GuestPicker
        guests={guests}
        selectedIdx={selectedGuestIdx}
        onSelect={handleSelectGuest}
        onRemove={handleRemoveGuest}
      />

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
    </div>
  )
}

export default Checkin
