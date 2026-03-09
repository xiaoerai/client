import { z } from 'zod'

// 登录表单验证
export const loginFormSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, '请输入正确的手机号'),
  code: z.string().regex(/^\d{4,6}$/, '请输入验证码'),
})

export type LoginFormData = z.infer<typeof loginFormSchema>

// 手机号验证（单独用于发送验证码）
export const phoneSchema = z.string().regex(/^1\d{10}$/, '请输入正确的手机号')

// 入住表单验证
export const checkinFormSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  idNumber: z.string().regex(/^\d{17}[\dXx]$/, '身份证号格式不正确'),
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
})

export type CheckinFormData = z.infer<typeof checkinFormSchema>
