import { StateCreator } from 'zustand'

export interface Order {
  orderId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
}

export interface SelectedOrder {
  orderId: string
  roomName: string
  checkInDate: string
  checkOutDate: string
}

export interface OrderSlice {
  // 订单列表（null = 未拉取, [] = 拉取了但没订单）
  orders: Order[] | null
  setOrders: (orders: Order[] | null) => void

  // 当前选中的订单
  selectedOrder: SelectedOrder | null
  setSelectedOrder: (order: SelectedOrder | null) => void
}

export const createOrderSlice: StateCreator<OrderSlice> = (set) => ({
  orders: null,
  setOrders: (orders) => set({ orders }),

  selectedOrder: null,
  setSelectedOrder: (order) => set({ selectedOrder: order }),
})
