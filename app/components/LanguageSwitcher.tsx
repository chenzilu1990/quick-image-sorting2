'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { i18n } from '@/i18n/settings';
import type { Locale } from '@/i18n/settings';
import { useDictionary } from '@/components/client-dictionary';

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathName = usePathname();
  const dict = useDictionary();
  
  // 创建重定向到其他语言版本的路径
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/';
    
    // 当前路径的语言参数
    const segments = pathName.split('/');
    segments[1] = locale;
    
    return segments.join('/');
  };

  return (
    <div className="language-select">
      <label htmlFor="language-select">{dict.navigation.language}:</label>
      <select 
        id="language-select" 
        value={locale}
        onChange={(e) => {
          window.location.href = redirectedPathName(e.target.value as Locale);
        }}
      >
        {i18n.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === 'zh' ? '中文' : 'English'}
          </option>
        ))}
      </select>
    </div>
  );
} 