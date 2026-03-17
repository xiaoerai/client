import { useEffect } from 'react'
import Taro from '@tarojs/taro'

export interface SelectedOrder {
  orderId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
}

/**
 * 路由保护 Hook
 * 未选择订单的用户自动跳转到首页
 */
export function useOrderAuth() {
  useEffect(() => {
    const order = Taro.getStorageSync('selectedOrder')
    if (!order) {
      Taro.redirectTo({ url: '/pages/index/index' })
    }
  }, [])
}

/**
 * 获取当前选中的订单
 */
export function useSelectedOrder(): SelectedOrder | null {
  return Taro.getStorageSync('selectedOrder') || null
}

/**
 * 获取已验证的手机号
 */
export function useVerifiedPhone(): string {
  return Taro.getStorageSync('verifiedPhone') || ''
}

/**
 * 清除订单选择状态（退出入住流程时调用）
 */
export function clearOrderSession() {
  Taro.removeStorageSync('selectedOrder')
  Taro.removeStorageSync('verifiedPhone')
}
