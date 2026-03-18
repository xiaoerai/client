import { get } from './request'

export interface CachedGuest {
  name: string
  idNumber: string
}

/**
 * 获取用户历史住客列表
 */
export async function getMyGuests(phone: string): Promise<CachedGuest[]> {
  const res = await get<CachedGuest[]>('/api/user/guests', { phone })
  if (res.success && res.data) {
    return res.data
  }
  return []
}
