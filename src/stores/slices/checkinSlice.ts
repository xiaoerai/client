import { StateCreator } from 'zustand'

export interface CheckinRecord {
  _id: string
  hostexOrderId: string
  roomId: string
  roomName: string
  phone: string
  checkInDate: string
  checkOutDate: string
  guestIds: string[]
  depositPaid: boolean
  status: 'pending' | 'checked_in' | 'checkout_pending' | 'checked_out' | 'refunded'
  createdAt: string
  updatedAt: string
}

export interface CheckinSlice {
  // 当前入住记录
  checkinRecord: CheckinRecord | null
  setCheckinRecord: (record: CheckinRecord | null) => void
}

export const createCheckinSlice: StateCreator<CheckinSlice> = (set) => ({
  checkinRecord: null,
  setCheckinRecord: (record) => set({ checkinRecord: record }),
})
