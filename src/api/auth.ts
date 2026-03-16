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
 * @returns token，登录成功后需要单独调用 getOrders 获取订单
 */
export async function login(
  phone: string,
  smsCode: string
): Promise<string | null> {
  // 获取微信 login code
  let wxCode = ''
  if (process.env.TARO_ENV === 'h5') {
    // H5 开发模式：使用 mock code
    wxCode = `h5_mock_${Date.now()}`
  } else {
    try {
      const loginRes = await Taro.login()
      wxCode = loginRes.code
    } catch (error) {
      console.error('[Auth] wx.login 失败:', error)
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
    return res.data.token
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
