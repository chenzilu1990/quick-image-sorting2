import 'server-only'
import type { Locale } from './settings'

// 为每种语言创建字典加载函数
const dictionaries = {
  zh: () => import('../dictionaries/zh.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]() 