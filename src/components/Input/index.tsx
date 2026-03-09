import { View, Text } from '@tarojs/components'
import './index.scss'

interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number' | 'password'
  maxLength?: number
  label?: string
  disabled?: boolean
  className?: string
  // 右侧按钮
  suffix?: React.ReactNode
  onSuffixClick?: () => void
}

function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  maxLength,
  label,
  disabled = false,
  className = '',
  suffix,
  onSuffixClick,
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <View className={`input-wrapper ${className}`}>
      {label && <Text className="input-label">{label}</Text>}
      <View className="input-container">
        <input
          className="input-field"
          type={type === 'number' ? 'tel' : type}
          inputMode={type === 'number' ? 'numeric' : undefined}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          onChange={handleChange}
        />
        {suffix && (
          <View className="input-suffix" onClick={onSuffixClick}>
            {suffix}
          </View>
        )}
      </View>
    </View>
  )
}

export default Input
