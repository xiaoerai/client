import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import i18n from 'i18next'

export type Language = 'zh' | 'en'

// 入住信息
export interface StayInfo {
  roomName: string
  dateRange: string
  nights: number
  isCheckedIn: boolean
}

// 民宿配置
export interface HotelConfig {
  name: string
  subtitle: string
  heroImage: string
  phone: string
  checkInTime: string
  checkOutTime: string
}

interface AppState {
  // 当前入住信息
  currentStay: StayInfo | null
  setCurrentStay: (stay: StayInfo | null) => void

  // 民宿配置
  hotelConfig: HotelConfig
  setHotelConfig: (config: Partial<HotelConfig>) => void

  // 用户信息
  userPhone: string | null
  setUserPhone: (phone: string | null) => void

  // 语言
  language: Language
  setLanguage: (lang: Language) => void
}

// 默认配置
const defaultHotelConfig: HotelConfig = {
  name: '悠然居',
  subtitle: 'URBAN RETREAT · EST.2024',
  heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  phone: '13800138000',
  checkInTime: '14:00',
  checkOutTime: '12:00',
}

// Taro Storage 适配器
const taroStorage = createJSONStorage<AppState>(() => ({
  getItem: (name) => Taro.getStorageSync(name) || null,
  setItem: (name, value) => Taro.setStorageSync(name, value),
  removeItem: (name) => Taro.removeStorageSync(name),
}))

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 入住状态
      currentStay: null,
      setCurrentStay: (stay) => set({ currentStay: stay }),

      // 民宿配置
      hotelConfig: defaultHotelConfig,
      setHotelConfig: (config) =>
        set((state) => ({
          hotelConfig: { ...state.hotelConfig, ...config },
        })),

      // 用户信息
      userPhone: null,
      setUserPhone: (phone) => set({ userPhone: phone }),

      // 语言
      language: 'zh',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang)
        set({ language: lang })
      },
    }),
    {
      name: 'app-storage',
      storage: taroStorage,
      partialize: (state) => ({
        userPhone: state.userPhone,
        language: state.language,
      }),
    }
  )
)
