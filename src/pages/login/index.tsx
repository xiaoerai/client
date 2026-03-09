import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Taro from '@tarojs/taro'
import { loginFormSchema, phoneSchema } from '../../utils/schemas'
import './index.scss'

function Login() {
  const { t } = useTranslation()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendCode = async () => {
    const result = phoneSchema.safeParse(phone)
    if (!result.success) {
      Taro.showToast({ title: result.error.issues[0].message, icon: 'none' })
      return
    }
    if (countdown > 0) return

    // TODO: 调用后端发送验证码
    console.log('Send code to:', phone)
    setCountdown(60)
    Taro.showToast({ title: t('login.codeSent'), icon: 'success' })
  }

  const handleLogin = async () => {
    const result = loginFormSchema.safeParse({ phone, code })
    if (!result.success) {
      Taro.showToast({ title: result.error.issues[0].message, icon: 'none' })
      return
    }

    setLoading(true)
    try {
      // TODO: 调用后端验证登录
      console.log('Login:', { phone, code })

      // 模拟登录成功
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 保存登录状态
      Taro.setStorageSync('phone', phone)
      Taro.setStorageSync('isLoggedIn', true)

      // 跳转首页
      Taro.redirectTo({ url: '/pages/index/index' })
    } catch {
      Taro.showToast({ title: t('login.failed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-header">
        <div className="welcome-text">{t('login.welcome')}</div>
        <div className="brand-name">
          <span className="brand-ai">AI</span> {t('login.brandSuffix')}
        </div>
        <div className="sub-text">{t('login.subTitle')}</div>
      </div>

      <div className="login-form">
        <div className="form-item">
          <div className="input-label">{t('login.phone')}</div>
          <input
            className="form-input"
            type="tel"
            maxLength={11}
            placeholder={t('login.phonePlaceholder')}
            value={phone}
            onInput={(e) => setPhone((e.target as HTMLInputElement).value)}
          />
        </div>

        <div className="form-item">
          <div className="input-label">{t('login.code')}</div>
          <div className="code-input-wrapper">
            <input
              className="form-input code-input"
              type="tel"
              maxLength={6}
              placeholder={t('login.codePlaceholder')}
              value={code}
              onInput={(e) => setCode((e.target as HTMLInputElement).value)}
            />
            <div
              className={`send-code-btn ${countdown > 0 ? 'disabled' : ''}`}
              onClick={handleSendCode}
            >
              {countdown > 0 ? `${countdown}s` : t('login.sendCode')}
            </div>
          </div>
        </div>
      </div>

      <div className="login-action">
        <div
          className={`btn-primary ${loading ? 'loading' : ''}`}
          onClick={handleLogin}
        >
          {loading ? t('common.loading') : t('login.submit')}
        </div>
      </div>

      <div className="login-footer">
        <span className="footer-text">{t('login.agreement')}</span>
      </div>
    </div>
  )
}

export default Login
