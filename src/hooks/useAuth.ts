import { useEffect } from 'react'
import Taro from '@tarojs/taro'

/**
 * 路由保护 Hook
 * 未登录用户自动跳转到登录页
 */
export function useAuth() {
  useEffect(() => {
    const isLoggedIn = Taro.getStorageSync('isLoggedIn')
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
    }
  }, [])
}

/**
 * 获取当前登录用户手机号
 */
export function usePhone(): string {
  return Taro.getStorageSync('phone') || ''
}

/**
 * 退出登录
 */
export function logout() {
  Taro.removeStorageSync('isLoggedIn')
  Taro.removeStorageSync('phone')
  Taro.redirectTo({ url: '/pages/login/index' })
}
