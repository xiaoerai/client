import { post, get } from './request'
import type { CheckInRecord } from './checkin'

export type PayChannel = 'alipay' | 'wechat'

// 创建支付订单结果
export interface CreatePaymentResult {
  tradeNO: string
  orderId: string
  amount: number // 分
  channel: PayChannel
  orderStr?: string
}

// 押金状态查询结果
export interface DepositStatusResult {
  status: 'created' | 'paid' | 'refunded'
  paidAt?: string
  checkin?: CheckInRecord
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
 * 查询押金状态
 */
export async function getDepositStatus(orderId: string): Promise<DepositStatusResult | null> {
  const res = await get<DepositStatusResult>(`/api/deposit/${orderId}/status`)
  if (res.success && res.data) {
    return res.data
  }
  return null
}
