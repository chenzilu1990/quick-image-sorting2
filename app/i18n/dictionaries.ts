// import 'server-only'
import type { Locale } from './settings'

// 使用动态导入确保代码分割和按需加载
const dictionaries = {
  zh: () => import('../dictionaries/zh.json').then(module => module.default),
  en: () => import('../dictionaries/en.json').then(module => module.default)
}

export const getDictionary = async (locale: Locale) => {
  console.log('getDictionary received locale:', locale);

  if (!dictionaries[locale]) {
    console.error(`Invalid locale requested: ${locale}. Defaulting to 'en'.`);
    return dictionaries['en']();
  }

  if (typeof dictionaries[locale] !== 'function') {
    console.error(`dictionaries[${locale}] is not a function, it is:`, typeof dictionaries[locale]);
    return dictionaries['en']();
  }
  
  return dictionaries[locale]();
} 