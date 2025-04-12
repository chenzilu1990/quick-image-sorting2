'use client';

import React from 'react';
import { useDictionary } from '@/components/hooks/client-dictionary';
import { Button } from '@/components/ui/Button';

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
    <div className="flex justify-center mt-4 gap-4">
      <Button 
        variant="primary"
        onClick={onDownloadRenamedImages}
        disabled={isDownloading}
      >
        {isDownloading ? dict.status.downloading : dict.buttons.downloadAll}
      </Button>
      
      <Button 
        variant="danger"
        onClick={onClearRenamedImages}
      >
        {dict.buttons.clearCache}
      </Button>
    </div>
  );
};

export default RenamedImageActions; 