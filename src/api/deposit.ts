import { post } from './request'
import type { CheckInRecord } from './checkin'

export type PayChannel = 'alipay' | 'wechat'

// 创建支付订单结果
export interface CreatePaymentResult {
  tradeNO: string
  orderId: string
  amount: number // 分
  channel: PayChannel
}

// 确认支付结果
export interface ConfirmPaymentResult {
  checkin: CheckInRecord
  deposit: {
    _id: string
    orderId: string
    amount: number
    channel: PayChannel
    status: 'created' | 'paid' | 'refunded'
    transactionId?: string
    paidAt?: string
  }
}

/**
 * 创建支付订单
 */
export async function createDeposit(
  orderId: string,
  channel: PayChannel = 'alipay'
): Promise<CreatePaymentResult | null> {
  const res = await post<CreatePaymentResult>('/api/deposit/create', { orderId, channel })
  if (res.success && res.data) {
    return res.data
  }
  return null
}

/**
 * 确认支付成功
 */
export async function confirmDeposit(
  orderId: string,
  transactionId: string
): Promise<ConfirmPaymentResult | null> {
  const res = await post<ConfirmPaymentResult>('/api/deposit/confirm', { orderId, transactionId })
  if (res.success && res.data) {
    return res.data
  }
  return null
}
