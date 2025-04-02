'use client';

import React from 'react';
import Link from 'next/link';

/**
 * 头部操作组件
 * 
 * 显示配置链接和其他顶部操作
 */
const HeaderActions: React.FC = () => {
  return (
    <div className="header-actions">
      <Link href="/config" className="config-link">
        <span className="icon">⚙️</span> 图片上传配置
      </Link>
      <Link href="/config/comfyui" className="config-link">
        <span className="icon">🎨</span> ComfyUI配置
      </Link>
    </div>
  );
};

export default HeaderActions; 