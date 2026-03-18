import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAppStore } from '../stores/useAppStore'
import type { SelectedOrder } from '../stores/slices/orderSlice'

// 重新导出类型，兼容旧引用
export type { SelectedOrder } from '../stores/slices/orderSlice'

/**
 * 路由保护 Hook
 * 未选择订单的用户自动跳转到首页
 */
export function useOrderAuth() {
  const selectedOrder = useAppStore((state) => state.selectedOrder)
  useEffect(() => {
    if (!selectedOrder) {
      Taro.redirectTo({ url: '/pages/index/index' })
    }
  }, [selectedOrder])
}

/**
 * 获取当前选中的订单
 */
export function useSelectedOrder(): SelectedOrder | null {
  return useAppStore((state) => state.selectedOrder)
}

/**
 * 清除订单选择状态（退出入住流程时调用）
 */
export function clearOrderSession() {
  useAppStore.getState().setSelectedOrder(null)
  useAppStore.getState().setCheckinRecord(null)
}
