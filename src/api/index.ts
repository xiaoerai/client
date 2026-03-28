// 请求方法
export { request, get, post } from './request'
export type { ApiResponse } from './request'

// 认证 API
export {
  sendSmsCode,
  login,
  logout,
  isLoggedIn,
} from './auth'
export type { Order } from './auth'

// 订单 API
export {
  getOrders,
  getOrderDetail,
  getRoomInfo,
} from './orders'
export type { OrderDetail, RoomInfo } from './orders'

// 入住 API
export {
  createCheckIn,
  getCheckIn,
  updateCheckIn,
  checkout,
} from './checkin'
export type { GuestInput, CheckInRecord, CreateCheckInParams, UpdateCheckInParams } from './checkin'

// 押金 API
export { createDeposit, getDepositStatus } from './deposit'
export type { PayChannel, CreatePaymentResult, DepositStatusResult } from './deposit'

// 用户 API
export { getMyGuests, removeMyGuest } from './user'
export type { CachedGuest } from './user'
