'use client';

import React, { useRef, useEffect } from 'react';
import type { ImageFile } from '@/types';
import PrefixInputForm from '@/components/renaming/PrefixInputForm';
import { RenameMode } from '@/types';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';

interface SelectedImagesScrollerProps {
  selectedCount: number;
  selectedImagesIds: string[];
  images: ImageFile[];
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClearSelection?: () => void;
  prefix: string;
  // selectedCount: number;
  onPrefixChange: (value: string) => void;
  onApplyPrefix: () => void;
  renameMode: RenameMode;
  onRenameModeChange: (mode: RenameMode) => void;
  suffix: string;
  onSuffixChange: (value: string) => void;
  customSequence: string;
  onCustomSequenceChange: (value: string) => void;
}

/**
 * 水平滚动的选中图片预览组件
 * 使用简单的HTML结构确保水平滚动
 */
const SelectedImagesScroller: React.FC<SelectedImagesScrollerProps> = ({
  selectedCount,
  selectedImagesIds,
  images,
  onImageError,
  onClearSelection,
  prefix,
  // selectedCount,
  onPrefixChange,
  onApplyPrefix,
  renameMode,
  onRenameModeChange,
  suffix,
  onSuffixChange,
  customSequence,
  onCustomSequenceChange
}) => {
  if (selectedCount === 0) return null;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 添加滚轮事件处理，将垂直滚动转换为水平滚动
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (container) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 先按选中顺序排序图片
  const selectedImages = images
    .filter(img => selectedImagesIds.includes(img.id))
    .sort((a, b) => {
      const indexA = selectedImagesIds.indexOf(a.id);
      const indexB = selectedImagesIds.indexOf(b.id);
      return indexA - indexB;
    });

  // TODO: Get sidebar collapsed state from context or props
  const isSidebarCollapsed = false; // Placeholder
  const leftPositionClass = isSidebarCollapsed ? 'left-16' : 'left-60';

  return (
    <div 
      className={clsx(
        "fixed bottom-0 right-0 bg-blue-50 border-t-2 border-blue-400 shadow-[-0px_-2px_10px_rgba(0,0,0,0.1)] p-4 z-30 transition-left duration-300 ease-in-out h-[250px] overflow-hidden",
        leftPositionClass
      )}
    >
      <div className="flex justify-between items-center mb-2.5 h-[30px] w-full">
        <h3 className="m-0 text-blue-600 text-base font-medium">已选择 {selectedCount} 张图片</h3>
        {onClearSelection && (
          <Button 
            variant="secondary"
            size="sm"
            onClick={onClearSelection}
          >
            清除选择
          </Button>
        )}
      </div>
      
      <div 
        className="w-full overflow-x-auto overflow-y-hidden whitespace-nowrap h-[130px] flex flex-row flex-nowrap items-center scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100"
        ref={scrollContainerRef}
      >
        {selectedImages.map((image, idx) => (
          <div 
            key={image.id} 
            className="relative flex-shrink-0 w-32 h-32 mr-4 border-2 border-blue-400 rounded-md overflow-hidden shadow hover:-translate-y-1 hover:shadow-md transition-all duration-200"
          >
            <div className="absolute top-1 right-1 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">{idx + 1}</div>
            <img 
              src={image.preview} 
              alt={`选中图片 ${idx + 1}`} 
              onError={onImageError}
              className="block w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white px-2 py-0.5 text-[10px] truncate z-10">{image.file.displayName || image.file.name}</div>
          </div>
        ))}
      </div>
      <PrefixInputForm
        prefix={prefix}
        selectedCount={selectedCount}
        onPrefixChange={onPrefixChange}
        onApplyPrefix={onApplyPrefix}
        renameMode={renameMode}
        onRenameModeChange={onRenameModeChange}
        suffix={suffix}
        onSuffixChange={onSuffixChange}
        customSequence={customSequence}
        onCustomSequenceChange={onCustomSequenceChange}
      />
    </div>
  );
};

export default SelectedImagesScroller; 