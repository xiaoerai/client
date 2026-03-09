import Taro from '@tarojs/taro'

// 路由路径映射
const routes = {
  home: '/pages/index/index',
  checkin: '/pages/checkin/index',
  deposit: '/pages/deposit/index',
  success: '/pages/success/index',
  checkout: '/pages/checkout/index',
  orders: '/pages/orders/index',
  guide: '/pages/guide/index',
  service: '/pages/service/index',
  help: '/pages/help/index',
} as const

type RouteName = keyof typeof routes

interface NavigateOptions {
  params?: Record<string, string | number>
}

export function useNavigate() {
  const navigateTo = (name: RouteName, options?: NavigateOptions) => {
    let url: string = routes[name]

    if (options?.params) {
      const query = Object.entries(options.params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
      url = `${url}?${query}`
    }

    Taro.navigateTo({ url })
  }

  const redirectTo = (name: RouteName, options?: NavigateOptions) => {
    let url: string = routes[name]

    if (options?.params) {
      const query = Object.entries(options.params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
      url = `${url}?${query}`
    }

    Taro.redirectTo({ url })
  }

  const goBack = () => {
    Taro.navigateBack()
  }

  const makeCall = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone })
  }

  return {
    navigateTo,
    redirectTo,
    goBack,
    makeCall,
  }
}
