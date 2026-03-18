import { StateCreator } from 'zustand'

export interface UserSlice {
  userPhone: string | null
  setUserPhone: (phone: string | null) => void
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  userPhone: null,
  setUserPhone: (phone) => set({ userPhone: phone }),
})
