'use client';

import React from 'react';

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
  return (
    <div className="actions">
      <button onClick={onClearImages} className="action-btn clear-btn">
        清空所有图片
      </button>
      <button onClick={onDeleteSelected} className="action-btn delete-btn" disabled={selectedCount === 0}>
        删除选中图片
      </button>
      <button onClick={onDownloadOrder} className="action-btn">
        下载排序结果
      </button>
      {selectedCount > 0 && (
        <button 
          onClick={onDownloadSelected}
          disabled={selectedCount === 0 || isDownloading}
          className="action-btn download-btn"
        >
          {isDownloading ? '下载中...' : `下载选中图片 (${selectedCount})`}
        </button>
      )}
    </div>
  );
};

export default ActionButtons; 