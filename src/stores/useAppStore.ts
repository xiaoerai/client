import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import { UserSlice, createUserSlice } from './slices/userSlice'
import { OrderSlice, createOrderSlice } from './slices/orderSlice'
import { CheckinSlice, createCheckinSlice } from './slices/checkinSlice'
import { HotelSlice, createHotelSlice } from './slices/hotelSlice'
import { LanguageSlice, createLanguageSlice } from './slices/languageSlice'

// 合并所有 slice 类型
export type AppState = UserSlice & OrderSlice & CheckinSlice & HotelSlice & LanguageSlice

// 重新导出类型，方便外部引用
export type { Order, SelectedOrder } from './slices/orderSlice'
export type { CheckinRecord } from './slices/checkinSlice'
export type { HotelConfig } from './slices/hotelSlice'
export type { Language } from './slices/languageSlice'

// Taro Storage 适配器
const taroStorage = createJSONStorage<AppState>(() => ({
  getItem: (name) => Taro.getStorageSync(name) || null,
  setItem: (name, value) => Taro.setStorageSync(name, value),
  removeItem: (name) => Taro.removeStorageSync(name),
}))

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createOrderSlice(...a),
      ...createCheckinSlice(...a),
      ...createHotelSlice(...a),
      ...createLanguageSlice(...a),
    }),
    {
      name: 'app-storage',
      storage: taroStorage,
      partialize: (state) => ({
        userPhone: state.userPhone,
        selectedOrder: state.selectedOrder,
        language: state.language,
      }),
    }
  )
)
