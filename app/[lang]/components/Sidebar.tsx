'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { Locale } from '../../i18n/settings';

export default function Sidebar({ lang }: { lang: Locale }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? '→' : '←'}
      </button>
      
      <div className="sidebar-content">
        <h2 className="sidebar-title">图片快速排序</h2>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link href={`/${lang}`} className={pathname === `/${lang}` ? 'active' : ''}>
                <span className="sidebar-icon">🏠</span>
                <span className="sidebar-text">主页</span>
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/config`} className={pathname === `/${lang}/config` ? 'active' : ''}>
                <span className="sidebar-icon">⚙️</span>
                <span className="sidebar-text">上传配置</span>
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/config/comfyui`} className={pathname === `/${lang}/config/comfyui` ? 'active' : ''}>
                <span className="sidebar-icon">🎨</span>
                <span className="sidebar-text">ComfyUI配置</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <LanguageSwitcher locale={lang} />
        </div>
      </div>
    </div>
  );
} 