'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
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
              <Link href="/" className={pathname === '/' ? 'active' : ''}>
                <span className="sidebar-icon">🏠</span>
                <span className="sidebar-text">主页</span>
              </Link>
            </li>
            <li>
              <Link href="/config" className={pathname === '/config' ? 'active' : ''}>
                <span className="sidebar-icon">⚙️</span>
                <span className="sidebar-text">上传配置</span>
              </Link>
            </li>
            <li>
              <Link href="/config/comfyui" className={pathname === '/config/comfyui' ? 'active' : ''}>
                <span className="sidebar-icon">🎨</span>
                <span className="sidebar-text">ComfyUI配置</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
} 