'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Locale } from '@/i18n/settings';
import { useDictionary } from '@/components/hooks/client-dictionary';
import clsx from 'clsx';
import { Home, Settings, Cog, PanelLeftClose, PanelRightClose, Upload } from 'lucide-react';

export default function Sidebar({ lang }: { lang: Locale }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const dict = useDictionary();
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidthClasses = clsx(
    'w-16',
    !isCollapsed && 'md:w-60'
  );

  const sidebarBaseClasses = 'fixed top-0 left-0 h-screen bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out z-40 overflow-y-auto flex flex-col';
  
  const navLinkBaseClasses = 'flex items-center px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-150';
  const navLinkActiveClasses = 'bg-blue-100 text-blue-700 font-semibold';

  const isFunctionallyCollapsed = isCollapsed;

  return (
    <div className={clsx(sidebarBaseClasses, sidebarWidthClasses)}>
      <div className={clsx("flex flex-col h-full p-4", isFunctionallyCollapsed && 'px-2')}>
        <h2 className={clsx("text-xl font-semibold mb-6 text-gray-800 whitespace-nowrap", isFunctionallyCollapsed && 'hidden')}>
          {dict.navigation.sidebarTitle}
        </h2>
        
        <div className={clsx("mb-6", isFunctionallyCollapsed && 'hidden')}>
          <LanguageSwitcher locale={lang} />
        </div>
        
        <nav className="flex-grow space-y-2">
          <Link 
            href={`/${lang}`} 
            className={clsx(navLinkBaseClasses, pathname === `/${lang}` && navLinkActiveClasses)}
            title={isFunctionallyCollapsed ? dict.navigation.home : ''}
          >
            <Home size={20} className={clsx(!isFunctionallyCollapsed && 'mr-3')} />
            <span className={clsx(isFunctionallyCollapsed && 'hidden')}>{dict.navigation.home}</span>
          </Link>
          
          <Link 
            href={`/${lang}/upload`} 
            className={clsx(navLinkBaseClasses, pathname.startsWith(`/${lang}/upload`) && navLinkActiveClasses)}
            title={isFunctionallyCollapsed ? dict.navigation.imageUpload : ''}
          >
            <Upload size={20} className={clsx(!isFunctionallyCollapsed && 'mr-3')} />
            <span className={clsx(isFunctionallyCollapsed && 'hidden')}>{dict.navigation.imageUpload}</span>
          </Link>
          
          <Link 
            href={`/${lang}/config`} 
            className={clsx(navLinkBaseClasses, pathname.startsWith(`/${lang}/config`) && !pathname.includes('comfyui') && navLinkActiveClasses)}
            title={isFunctionallyCollapsed ? dict.navigation.uploadConfig : ''}
          >
            <Settings size={20} className={clsx(!isFunctionallyCollapsed && 'mr-3')} />
            <span className={clsx(isFunctionallyCollapsed && 'hidden')}>{dict.navigation.uploadConfig}</span>
          </Link>
          <Link 
            href={`/${lang}/config/comfyui`} 
            className={clsx(navLinkBaseClasses, pathname.startsWith(`/${lang}/config/comfyui`) && navLinkActiveClasses)}
            title={isFunctionallyCollapsed ? dict.navigation.comfyUIConfig : ''}
          >
            <Cog size={20} className={clsx(!isFunctionallyCollapsed && 'mr-3')} />
            <span className={clsx(isFunctionallyCollapsed && 'hidden')}>{dict.navigation.comfyUIConfig}</span>
          </Link>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button 
            onClick={toggleSidebar} 
            className="hidden md:flex items-center justify-center w-full py-2 px-2 rounded-md text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            title={dict.navigation.toggleSidebar}
          >
            {isCollapsed ? <PanelRightClose size={20} /> : <PanelLeftClose size={20} />}
            <span className="sr-only">{dict.navigation.toggleSidebar}</span>
          </button>
          
          {!isCollapsed && <p className="hidden md:block text-xs text-gray-500 text-center mt-4">© 2024</p>}
        </div>
      </div>
    </div>
  );
} 