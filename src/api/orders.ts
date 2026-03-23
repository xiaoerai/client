import { get } from './request'
import type { Order } from './auth'

// 订单详情（包含房间信息）
export interface OrderDetail extends Order {
  hotelId: string
  depositStatus: 'unpaid' | 'paid' | 'refunded'
  status: 'pending' | 'checked_in' | 'checked_out'
}

// 房间信息（入住成功后展示）
export interface RoomInfo {
  roomNumber: string
  doorCode: string
  wifiName: string
  wifiPassword: string
  checkInDate: string
  checkOutDate: string
}

// 入住人信息
export interface GuestInfo {
  name: string
  idNumber: string
  phone: string
  idCardFrontUrl?: string
}

/**
 * 获取订单列表
 */
export async function getOrders(phone: string): Promise<Order[]> {
  const res = await get<Order[]>('/api/orders', { phone })
  if (res.success && res.data) {
    return res.data
  }
  return []
}

/**
 * 获取订单详情
 */
export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const res = await get<OrderDetail>(`/api/orders/${orderId}`)
  if (res.success && res.data) {
    return res.data
  }
  return null
}

/**
 * 获取房间信息（入住成功后）
 */
export async function getRoomInfo(orderId: string): Promise<RoomInfo | null> {
  const res = await get<RoomInfo>(`/api/orders/${orderId}/room-info`)
  if (res.success && res.data) {
    return res.data
  }
  return null
}
