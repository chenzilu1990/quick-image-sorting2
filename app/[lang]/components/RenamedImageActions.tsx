'use client';

import React from 'react';
import { useDictionary } from './client-dictionary';

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
  const dict = useDictionary();
  
  return (
    <div className="renamed-actions">
      <button 
        onClick={onDownloadRenamedImages}
        disabled={isDownloading}
        className="action-btn download-btn"
      >
        {isDownloading ? dict.status.downloading : dict.buttons.downloadAll}
      </button>
      
      <button 
        onClick={onClearRenamedImages}
        className="action-btn clear-btn"
      >
        {dict.buttons.clearCache}
      </button>
    </div>
  );
};

export default RenamedImageActions; 