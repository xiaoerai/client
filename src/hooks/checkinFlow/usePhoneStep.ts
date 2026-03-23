import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useAppStore } from '../../stores/useAppStore'
import { sendSmsCode, login, getOrders } from '../../api'

interface UsePhoneStepOptions {
  onVerified: () => void
}

export function usePhoneStep({ onVerified }: UsePhoneStepOptions) {
  const setUserPhone = useAppStore((state) => state.setUserPhone)
  const setOrders = useAppStore((state) => state.setOrders)

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const sendCode = useCallback(async () => {
    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入11位手机号', icon: 'none' })
      return
    }
    if (countdown > 0) return
    try {
      const success = await sendSmsCode(phone)
      if (success) {
        setCountdown(60)
        Taro.showToast({ title: '验证码已发送', icon: 'none' })
      } else {
        Taro.showToast({ title: '发送失败，请重试', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '发送失败，请重试', icon: 'none' })
    }
  }, [phone, countdown])

  const verify = useCallback(async () => {
    if (phone.length !== 11) {
      Taro.showToast({ title: '请输入11位手机号', icon: 'none' })
      return
    }
    if (code.length < 4) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const token = await login(phone, code)
      if (token) {
        setUserPhone(phone)
        const orderList = await getOrders(phone)
        setOrders(orderList)
        onVerified()
      } else {
        Taro.showToast({ title: '验证码错误', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '验证失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }, [phone, code])

  const reset = () => {
    setPhone('')
    setCode('')
  }

  return {
    phone,
    setPhone,
    code,
    setCode,
    countdown,
    loading,
    sendCode,
    verify,
    reset,
  }
}
