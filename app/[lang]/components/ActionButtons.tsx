'use client';

import React from 'react';
import { useDictionary } from './client-dictionary';

interface ActionButtonsProps {
  selectedCount: number;
  isDownloading: boolean;
  onClearImages: () => void;
  onDeleteSelected: () => void;
  onDownloadOrder: () => void;
  onDownloadSelected: () => void;
}

/**
 * 操作按钮组件
 * 
 * 提供清空、删除、下载等操作的按钮组
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedCount,
  isDownloading,
  onClearImages,
  onDeleteSelected,
  onDownloadOrder,
  onDownloadSelected
}) => {
  const dict = useDictionary();
  
  return (
    <div className="actions">
      <button onClick={onClearImages} className="action-btn clear-btn">
        {dict.buttons.clearAll}
      </button>
      <button onClick={onDeleteSelected} className="action-btn delete-btn" disabled={selectedCount === 0}>
        {dict.buttons.delete}
      </button>
      <button onClick={onDownloadOrder} className="action-btn">
        {dict.buttons.download}
      </button>
      {selectedCount > 0 && (
        <button 
          onClick={onDownloadSelected}
          disabled={selectedCount === 0 || isDownloading}
          className="action-btn download-btn"
        >
          {isDownloading 
            ? dict.status.downloading 
            : `${dict.buttons.downloadSelected} (${selectedCount})`}
        </button>
      )}
    </div>
  );
};

export default ActionButtons; 