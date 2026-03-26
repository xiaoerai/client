import Taro from '@tarojs/taro'

declare const my: {
  getAuthCode(opts: {
    scopes: string
    success: (res: { authCode: string }) => void
    fail: (err: unknown) => void
  }): void
}
import { post } from './request'

// 订单信息
export interface Order {
  orderId: string
  roomName: string
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
  // 获取平台授权码
  let authCode = ''
  let platform: 'alipay' | 'wechat' | 'h5' = 'h5'

  if (process.env.TARO_ENV === 'alipay') {
    platform = 'alipay'
    try {
      const authRes = await new Promise<{ authCode: string }>((resolve, reject) => {
        my.getAuthCode({
          scopes: 'auth_base',
          success: (res: { authCode: string }) => resolve(res),
          fail: (err: unknown) => reject(err),
        })
      })
      authCode = authRes.authCode
    } catch (error) {
      console.error('[Auth] getAuthCode 失败:', error)
      return null
    }
  } else if (process.env.TARO_ENV === 'weapp') {
    platform = 'wechat'
    try {
      const loginRes = await Taro.login()
      authCode = loginRes.code
    } catch (error) {
      console.error('[Auth] wx.login 失败:', error)
      return null
    }
  } else {
    platform = 'h5'
    authCode = `h5_mock_${phone}`
  }

  const res = await post<LoginResponse>('/api/auth/login', {
    phone,
    smsCode,
    code: authCode,
    platform,
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
