import { get, post, request } from './request'

// 住客信息
export interface GuestInput {
  name: string
  idNumber: string
  idImageUrl?: string
}

// 入住记录
export interface CheckInRecord {
  _id: string
  hostexOrderId: string
  roomId: string
  roomName: string
  phone: string
  checkInDate: string
  checkOutDate: string
  guestIds: string[]
  depositPaid: boolean
  depositAmount?: number
  status: 'pending' | 'checked_in' | 'checked_out'
  createdAt: string
  updatedAt: string
}

// 创建入住记录参数
export interface CreateCheckInParams {
  orderId: string
  roomId: string
  roomName: string
  phone: string
  checkInDate: string
  checkOutDate: string
  guest: GuestInput
}

// 更新入住记录参数
export interface UpdateCheckInParams {
  depositPaid?: boolean
  depositAmount?: number
  status?: CheckInRecord['status']
}

/**
 * 创建入住记录 + 住客
 */
export async function createCheckIn(params: CreateCheckInParams): Promise<CheckInRecord | null> {
  const res = await post<CheckInRecord>('/api/checkin', params)
  if (res.success && res.data) {
    return res.data
  }
  return null
}

/**
 * 查询入住记录
 */
export async function getCheckIn(orderId: string): Promise<CheckInRecord | null> {
  const res = await get<CheckInRecord>(`/api/checkin/${orderId}`)
  if (res.success && res.data) {
    return res.data
  }
  return null
}

/**
 * 更新入住记录
 */
export async function updateCheckIn(orderId: string, params: UpdateCheckInParams): Promise<boolean> {
  const res = await request(`/api/checkin/${orderId}`, {
    method: 'PUT',
    data: params,
  })
  return res.success
}
