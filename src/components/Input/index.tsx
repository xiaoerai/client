import { Input as TaroInput, View, Text } from '@tarojs/components'
import { ITouchEvent } from '@tarojs/components/types/common'
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
  const handleInput = (e: ITouchEvent & { detail: { value: string } }) => {
    onChange(e.detail.value)
  }

  // 阻止事件冒泡，防止 modal overlay 捕获点击
  const stopPropagation = (e: ITouchEvent) => {
    e.stopPropagation()
  }

  return (
    <View
      className={`input-wrapper ${className}`}
      onClick={stopPropagation}
    >
      {label && <Text className="input-label">{label}</Text>}
      <View className="input-container">
        <TaroInput
          className="input-field"
          type={type === 'password' ? 'text' : type}
          password={type === 'password'}
          value={value}
          placeholder={placeholder}
          maxlength={maxLength}
          disabled={disabled}
          onInput={handleInput}
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
