'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { i18n } from '../../i18n/settings';
import type { Locale } from '../../i18n/settings';

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathName = usePathname();
  
  // 创建重定向到其他语言版本的路径
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/';
    
    // 当前路径的语言参数
    const segments = pathName.split('/');
    segments[1] = locale;
    
    return segments.join('/');
  };

  return (
    <div className="language-switcher">
      <ul>
        {i18n.locales.map((loc) => (
          <li key={loc} className={locale === loc ? 'active' : ''}>
            <Link href={redirectedPathName(loc)} locale={loc}>
              {loc === 'zh' ? '中文' : 'English'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 