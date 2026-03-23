import { get, request } from './request'

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

/**
 * 解除用户与住客的关联
 */
export async function removeMyGuest(phone: string, idNumber: string): Promise<boolean> {
  const res = await request(`/api/user/guests?phone=${phone}&idNumber=${idNumber}`, {
    method: 'DELETE',
  })
  return res.success
}
