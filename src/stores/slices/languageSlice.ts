import { StateCreator } from 'zustand'
import i18n from 'i18next'

export type Language = 'zh' | 'en'

export interface LanguageSlice {
  language: Language
  setLanguage: (lang: Language) => void
}

export const createLanguageSlice: StateCreator<LanguageSlice> = (set) => ({
  language: 'zh',
  setLanguage: (lang) => {
    i18n.changeLanguage(lang)
    set({ language: lang })
  },
})
