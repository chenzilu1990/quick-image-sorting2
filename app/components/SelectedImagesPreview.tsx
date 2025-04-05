'use client';

import React from 'react';
import type { ImageFile } from '../types';

interface SelectedImagesPreviewProps {
  selectedCount: number;
  selectedImagesIds: string[];
  images: ImageFile[];
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClearSelection?: () => void;
}

/**
 * 选中图片预览组件
 * 
 * 显示当前被选中的图片，包括排序顺序
 */
const SelectedImagesPreview: React.FC<SelectedImagesPreviewProps> = ({
  selectedCount,
  selectedImagesIds,
  images,
  onImageError,
  onClearSelection
}) => {
  if (selectedCount === 0) return null;

  // 先按选中顺序排序图片
  const selectedImages = images
    .filter(img => selectedImagesIds.includes(img.id))
    .sort((a, b) => {
      const indexA = selectedImagesIds.indexOf(a.id);
      const indexB = selectedImagesIds.indexOf(b.id);
      return indexA - indexB;
    });

  return (
    <div className="selected-images-preview">
      <div className="selected-images-header">
        <h3>已选择 {selectedCount} 张图片</h3>
        {onClearSelection && (
          <button 
            onClick={onClearSelection}
            className="clear-selection-btn"
            title="清除选择"
          >
            清除选择
          </button>
        )}
      </div>
      <div className="selected-images-container">
        {selectedImages.map((image, idx) => (
          <div key={image.id} className="selected-thumbnail">
            <div className="selection-number">{idx + 1}</div>
            <img 
              src={image.preview} 
              alt={`选中图片 ${idx + 1}`} 
              onError={onImageError}
            />
            <div className="selected-filename">{image.file.displayName || image.file.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedImagesPreview; 