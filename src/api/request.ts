import Taro from '@tarojs/taro'

// 环境变量（由 config/dev.ts 或 config/prod.ts 的 defineConstants 注入）
declare const API_BASE_URL: string
declare const CLOUD_ENV_ID: string

// 微信小程序全局对象（仅在微信环境存在）
declare const wx: {
  cloud?: {
    callContainer: (options: {
      config: { env: string }
      path: string
      method: string
      data?: object
      header?: Record<string, string>
    }) => Promise<{ data: unknown }>
  }
}

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
 * 统一请求方法
 * - H5 环境：使用 Taro.request（方便本地调试）
 * - 小程序环境：使用 wx.cloud.callContainer（云托管内网调用）
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'POST', data, header = {} } = options

  // 添加 token
  const token = getToken()
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  try {
    // H5 环境：使用 Taro.request
    if (process.env.TARO_ENV === 'h5') {
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
        error: res.data?.error || '请求失败',
        code: res.statusCode,
      }
    }

    // 微信小程序环境：使用 wx.cloud.callContainer
    if (process.env.TARO_ENV === 'weapp') {
      if (!CLOUD_ENV_ID) {
        console.error('[API] CLOUD_ENV_ID 未配置')
        return { success: false, error: '云环境未配置' }
      }

      // 确保云开发已初始化
      if (!wx.cloud) {
        console.error('[API] wx.cloud 不可用')
        return { success: false, error: '云开发不可用' }
      }

      const res = await wx.cloud.callContainer({
        config: {
          env: CLOUD_ENV_ID,
        },
        path,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'X-WX-SERVICE': 'server', // 云托管服务名
          ...header,
        },
      })

      return res.data as ApiResponse<T>
    }

    // 其他小程序环境（支付宝等）：使用 Taro.request
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
      error: res.data?.error || '请求失败',
      code: res.statusCode,
    }
  } catch (error) {
    console.error('[API] 请求失败:', path, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误',
    }
  }
}

// 便捷方法
export const get = <T>(path: string, data?: object) =>
  request<T>(path, { method: 'GET', data })

export const post = <T>(path: string, data?: object) =>
  request<T>(path, { method: 'POST', data })
