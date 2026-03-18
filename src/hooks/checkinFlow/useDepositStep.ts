import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../stores/useAppStore'
import { createDeposit, confirmDeposit } from '../../api'
import type { PayChannel } from '../../api'

interface UseDepositStepOptions {
  onSuccess: () => void
}

export function useDepositStep({ onSuccess }: UseDepositStepOptions) {
  const selectedOrder = useAppStore((state) => state.selectedOrder)
  const setCheckinRecord = useAppStore((state) => state.setCheckinRecord)

  const [paying, setPaying] = useState(false)
  const depositAmount = 500 // TODO: 从后端获取

  const pay = async (channel: PayChannel) => {
    const orderId = selectedOrder?.orderId
    if (!orderId) return

    setPaying(true)
    try {
      // 1. 创建支付订单
      const payment = await createDeposit(orderId, channel)
      if (!payment) {
        Taro.showToast({ title: '创建支付订单失败', icon: 'none' })
        return
      }

      // 2. 调起支付（H5 环境 mock，直接跳过）
      if (channel === 'alipay' && process.env.TARO_ENV !== 'h5') {
        // @ts-ignore - 支付宝小程序 API
        await Taro.tradePay({ tradeNO: payment.tradeNO })
      }

      // 3. 确认支付
      // [MOCK] 真实环境由收钱吧回调后端触发，前端不调此接口
      // 接入真实支付后删除此行，改为轮询或监听支付状态
      const result = await confirmDeposit(orderId, payment.tradeNO)
      if (!result) {
        Taro.showToast({ title: '支付确认失败', icon: 'none' })
        return
      }

      // 4. 更新全局状态
      setCheckinRecord(result.checkin)

      // 5. 成功
      onSuccess()
    } catch {
      Taro.showToast({ title: '支付失败，请重试', icon: 'none' })
    } finally {
      setPaying(false)
    }
  }

  return {
    selectedOrder,
    paying,
    depositAmount,
    payAlipay: () => pay('alipay'),
    payWechat: () => pay('wechat'),
  }
}
