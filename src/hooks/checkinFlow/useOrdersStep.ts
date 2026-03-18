import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useAppStore, Order } from '../../stores/useAppStore'
import { getOrders, getCheckIn } from '../../api'

type OrderResult = 'no_record' | 'pending_deposit' | 'paid'

interface UseOrdersStepOptions {
  onLoading: () => void
  onResult: (result: OrderResult) => void
  onNavigateCheckin: () => void
}

export function useOrdersStep({ onLoading, onResult, onNavigateCheckin }: UseOrdersStepOptions) {
  const orders = useAppStore((state) => state.orders)
  const setOrders = useAppStore((state) => state.setOrders)
  const setSelectedOrder = useAppStore((state) => state.setSelectedOrder)
  const setCheckinRecord = useAppStore((state) => state.setCheckinRecord)

  const [loading, setLoading] = useState(false)

  const fetchOrders = async (phone: string) => {
    setLoading(true)
    try {
      const orderList = await getOrders(phone)
      setOrders(orderList)
    } catch {
      Taro.showToast({ title: '查询失败，请重试', icon: 'none' })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const selectOrder = async (order: Order) => {
    setSelectedOrder({
      orderId: order.orderId,
      roomName: order.roomName,
      checkInDate: order.checkInDate,
      checkOutDate: order.checkOutDate,
    })

    onLoading()
    const record = await getCheckIn(order.orderId)

    if (!record) {
      onNavigateCheckin()
      onResult('no_record')
    } else if (!record.depositPaid) {
      setCheckinRecord(record)
      onResult('pending_deposit')
    } else {
      setCheckinRecord(record)
      onResult('paid')
    }
  }

  const clearOrders = () => {
    setOrders(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  return {
    orders,
    loading,
    fetchOrders,
    selectOrder,
    clearOrders,
    formatDate,
  }
}
