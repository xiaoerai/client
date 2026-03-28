import { StateCreator } from 'zustand'

export interface HotelConfig {
  name: string
  subtitle: string
  heroImage: string
  phone: string
  checkInTime: string
  checkOutTime: string
}

export interface HotelSlice {
  hotelConfig: HotelConfig
  setHotelConfig: (config: Partial<HotelConfig>) => void
}

const defaultHotelConfig: HotelConfig = {
  name: '悠然居',
  subtitle: 'URBAN RETREAT · EST.2024',
  heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  phone: '13800138000',
  checkInTime: '14:00',
  checkOutTime: '12:00',
}

export const createHotelSlice: StateCreator<HotelSlice> = (set) => ({
  hotelConfig: defaultHotelConfig,
  setHotelConfig: (config) =>
    set((state) => ({
      hotelConfig: { ...state.hotelConfig, ...config },
    })),
})
