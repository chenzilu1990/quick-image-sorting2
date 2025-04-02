'use client';

import React from 'react';

interface RenamedImageActionsProps {
  isDownloading: boolean;
  onDownloadRenamedImages: () => void;
  onClearRenamedImages: () => void;
}

/**
 * 已重命名图片操作组件
 * 
 * 提供下载和清空重命名图片的操作按钮
 */
const RenamedImageActions: React.FC<RenamedImageActionsProps> = ({
  isDownloading,
  onDownloadRenamedImages,
  onClearRenamedImages
}) => {
  return (
    <div className="renamed-actions">
      <button 
        onClick={onDownloadRenamedImages}
        disabled={isDownloading}
        className="action-btn download-btn"
      >
        {isDownloading ? '下载中...' : '下载所有重命名图片'}
      </button>
      
      <button 
        onClick={onClearRenamedImages}
        className="action-btn clear-btn"
      >
        清空重命名图片
      </button>
    </div>
  );
};

export default RenamedImageActions; 