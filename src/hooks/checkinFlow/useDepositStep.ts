import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../stores/useAppStore'
import { createDeposit, getDepositStatus } from '../../api'

interface UseDepositStepOptions {
  onSuccess: () => void
}

export function useDepositStep({ onSuccess }: UseDepositStepOptions) {
  const selectedOrder = useAppStore((state) => state.selectedOrder)
  const setCheckinRecord = useAppStore((state) => state.setCheckinRecord)
  const [paying, setPaying] = useState(false)
  const depositAmount = 500

  const payAlipay = async () => {
    const orderId = selectedOrder?.orderId
    if (!orderId) return

    if (process.env.TARO_ENV === 'h5') {
      Taro.showToast({ title: '请在支付宝小程序支付', icon: 'none' })
      return
    }

    setPaying(true)
    try {
      const payment = await createDeposit(orderId, 'alipay')
      if (!payment || !payment.tradeNO) {
        Taro.showToast({ title: '支付参数异常', icon: 'none' })
        return
      }

      // @ts-ignore - 支付宝小程序 API
      const tradeResult = await Taro.tradePay({ tradeNO: payment.tradeNO }) as { resultCode: string }
      // 9000 成功，8000 处理中，其余为取消或失败
      if (tradeResult.resultCode !== '9000' && tradeResult.resultCode !== '8000') {
        Taro.showToast({ title: '支付已取消', icon: 'none' })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))
      const status = await getDepositStatus(orderId)
      if (status?.status !== 'paid') {
        Taro.showToast({ title: '支付结果待确认，请刷新页面', icon: 'none', duration: 3000 })
        return
      }

      if (status.checkin) setCheckinRecord(status.checkin)
      onSuccess()
    } catch {
      Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
    } finally {
      setPaying(false)
    }
  }

  return { selectedOrder, paying, depositAmount, payAlipay }
}
