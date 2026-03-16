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
  submitCheckin,
  getRoomInfo,
} from './orders'
export type { OrderDetail, RoomInfo, GuestInfo } from './orders'
