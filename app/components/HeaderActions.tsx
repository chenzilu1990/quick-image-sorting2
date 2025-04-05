'use client';

import Link from 'next/link';

/**
 * 头部操作组件
 * 
 * 显示配置链接和其他顶部操作
 */
export default function HeaderActions() {
  return (
    <div className="header-actions">
      <div className="app-version">
        <span title="版本号">v1.0.3</span>
      </div>
    </div>
  );
} 