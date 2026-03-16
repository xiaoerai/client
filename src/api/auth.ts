import Taro from '@tarojs/taro'
import { post } from './request'

// 订单信息
export interface Order {
  orderId: string
  roomNumber: string
  checkInDate: string
  checkOutDate: string
}

// 发送验证码响应
interface SendCodeResponse {
  success: boolean
}

// 登录响应
interface LoginResponse {
  token: string
  orders: Order[]
}

/**
 * 发送短信验证码
 */
export async function sendSmsCode(phone: string): Promise<boolean> {
  const res = await post<SendCodeResponse>('/api/sms/send', { phone })
  return res.success
}

/**
 * 登录（验证码 + 微信 code）
 * @param phone 手机号
 * @param smsCode 短信验证码
 * @returns token 和订单列表
 */
export async function login(
  phone: string,
  smsCode: string
): Promise<{ token: string; orders: Order[] } | null> {
  // 获取微信 login code
  let wxCode = ''
  try {
    const loginRes = await Taro.login()
    wxCode = loginRes.code
  } catch (error) {
    console.error('[Auth] wx.login 失败:', error)
    // H5 环境下没有 wx.login，继续执行
    if (process.env.TARO_ENV !== 'h5') {
      return null
    }
  }

  const res = await post<LoginResponse>('/api/auth/login', {
    phone,
    smsCode,
    code: wxCode,
  })

  if (res.success && res.data) {
    // 存储 token
    Taro.setStorageSync('token', res.data.token)
    return {
      token: res.data.token,
      orders: res.data.orders,
    }
  }

  return null
}

/**
 * 退出登录
 */
export function logout(): void {
  Taro.removeStorageSync('token')
  Taro.removeStorageSync('userPhone')
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  try {
    const token = Taro.getStorageSync('token')
    return !!token
  } catch {
    return false
  }
}
