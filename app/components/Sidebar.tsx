'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Locale } from '@/i18n/settings';
import { useDictionary } from '@/components/client-dictionary';

export default function Sidebar({ lang }: { lang: Locale }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const dict = useDictionary();
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* <button className="sidebar-toggle" onClick={toggleSidebar} title={dict.navigation.toggleSidebar}>
        {isCollapsed ? '→' : '←'}
      </button> */}
      
      <div className="sidebar-content">
        <h2 className="sidebar-title">{dict.navigation.sidebarTitle}</h2>
        
        <div className="sidebar-language-switcher">
          <LanguageSwitcher locale={lang} />
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link href={`/${lang}`} className={pathname === `/${lang}` ? 'active' : ''}>
                <span className="sidebar-icon">🏠</span>
                <span className="sidebar-text">{dict.navigation.home}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/config`} className={pathname === `/${lang}/config` ? 'active' : ''}>
                <span className="sidebar-icon">⚙️</span>
                <span className="sidebar-text">{dict.navigation.uploadConfig}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/config/comfyui`} className={pathname === `/${lang}/config/comfyui` ? 'active' : ''}>
                <span className="sidebar-icon">🎨</span>
                <span className="sidebar-text">{dict.navigation.comfyUIConfig}</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          {/* 底部可以添加其他内容 */}
        </div>
      </div>
    </div>
  );
} 