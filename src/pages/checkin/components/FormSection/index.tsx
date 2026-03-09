import { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import './index.scss'

interface FormData {
  name: string
  idNumber: string
  phone: string
}

interface FormSectionProps {
  form: FormData
  onChange: (field: keyof FormData, value: string) => void
}

export default function FormSection({ form, onChange }: FormSectionProps) {
  const { t } = useTranslation()

  const getInputValue = (e: FormEvent<HTMLInputElement>): string => {
    const detail = (e as unknown as { detail?: { value?: string } }).detail
    return detail?.value ?? (e.target as HTMLInputElement).value ?? ''
  }

  const handleInput = (field: keyof FormData) => (e: FormEvent<HTMLInputElement>) => {
    onChange(field, getInputValue(e))
  }

  return (
    <div className="form-section">
      <div className="section-label">{t('checkin.basicInfo')}</div>

      <div className="form-item">
        <span className="form-label">{t('guestInfo.name')}</span>
        <input
          className="form-input"
          type="text"
          placeholder={t('checkin.namePlaceholder')}
          value={form.name}
          onInput={handleInput('name')}
        />
      </div>

      <div className="form-item">
        <span className="form-label">{t('guestInfo.idNumber')}</span>
        <input
          className="form-input"
          type="text"
          placeholder={t('checkin.idPlaceholder')}
          value={form.idNumber}
          onInput={handleInput('idNumber')}
        />
      </div>

      <div className="form-item">
        <span className="form-label">{t('guestInfo.phone')}</span>
        <input
          className="form-input"
          type="tel"
          placeholder={t('checkin.phonePlaceholder')}
          value={form.phone}
          maxLength={11}
          onInput={handleInput('phone')}
        />
      </div>
    </div>
  )
}
