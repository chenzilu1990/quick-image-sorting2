'use client';

import React from 'react';
import { useDictionary } from '@/components/hooks/client-dictionary';
import { Button } from '@/components/ui/Button';

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
    <div className="flex justify-center mt-8 gap-4">
      <Button variant="danger" onClick={onClearImages}>
        {dict.buttons.clearAll}
      </Button>
      <Button variant="danger" onClick={onDeleteSelected} disabled={selectedCount === 0}>
        {dict.buttons.delete}
      </Button>
      <Button variant="primary" onClick={onDownloadOrder}>
        {dict.buttons.download}
      </Button>
      {selectedCount > 0 && (
        <Button 
          variant="primary"
          onClick={onDownloadSelected}
          disabled={selectedCount === 0 || isDownloading}
        >
          {isDownloading 
            ? dict.status.downloading 
            : `${dict.buttons.downloadSelected} (${selectedCount})`}
        </Button>
      )}
    </div>
  );
};

export default ActionButtons; 