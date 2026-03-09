import { useTranslation } from 'react-i18next'
import Icon from '../../../../components/Icon'
import './index.scss'

interface UploadSectionProps {
  idFront: string
  isRecognizing?: boolean
  onChoose: () => void
}

export default function UploadSection({ idFront, isRecognizing, onChoose }: UploadSectionProps) {
  const { t } = useTranslation()

  return (
    <div className="upload-section">
      <div className="section-label">{t('guestInfo.uploadId')}</div>

      <div className="upload-item" onClick={onChoose}>
        {idFront ? (
          <>
            <img className="upload-preview" src={idFront} alt="身份证正面" />
            {isRecognizing && <div className="recognizing-mask">识别中...</div>}
          </>
        ) : (
          <>
            <Icon name="camera" size={24} color="#a08c6a" />
            <span className="upload-text">{t('guestInfo.idFront')}</span>
            <span className="upload-hint">上传后自动识别（可选）</span>
          </>
        )}
      </div>
    </div>
  )
}
