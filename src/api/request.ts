import Taro from '@tarojs/taro'

// 环境变量
declare const API_BASE_URL: string

// 通用响应格式
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: number
}

// 请求配置
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: object
  header?: Record<string, string>
}

// 获取存储的 token
function getToken(): string | null {
  try {
    return Taro.getStorageSync('token') || null
  } catch {
    return null
  }
}

/**
 * 统一请求方法（H5、支付宝等非微信环境）
 * 微信小程序使用 request.weapp.ts
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'POST', data, header = {} } = options

  const token = getToken()
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await Taro.request({
      url: `${API_BASE_URL}${path}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
    })

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as ApiResponse<T>
    }

    return {
      success: false,
      error: res.data?.error || 'Request failed',
      code: res.statusCode,
    }
  } catch (error) {
    console.error('[API] Request failed:', path, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// 便捷方法
export const get = <T>(path: string, data?: object) =>
  request<T>(path, { method: 'GET', data })

export const post = <T>(path: string, data?: object) =>
  request<T>(path, { method: 'POST', data })
