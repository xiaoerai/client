import { useEffect } from 'react'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
// i18n
import i18n from './locales'
// 全局样式
import './app.scss'

function App(props) {
  // 根据系统语言自动设置
  useEffect(() => {
    const systemInfo = Taro.getSystemInfoSync()
    const systemLang = systemInfo.language || navigator?.language || 'zh'
    const lang = systemLang.startsWith('zh') ? 'zh' : 'en'
    i18n.changeLanguage(lang)
  }, [])

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})

  return props.children
}

export default App
