'use client';

import React from 'react';
import type { ImageFile } from '../types';

interface SelectedImagesPreviewProps {
  selectedCount: number;
  selectedImagesIds: string[];
  images: ImageFile[];
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
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
  onImageError
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="selected-images-preview">
      <div className="selected-images-header">
        <h3>已选择 {selectedCount} 张图片</h3>
      </div>
      <div className="selected-images-container">
        {images
          .filter(img => selectedImagesIds.includes(img.id))
          .map((image, idx) => {
            const sortedIndex = selectedImagesIds.indexOf(image.id);
            return (
              <div key={image.id} className="selected-thumbnail">
                <div className="selection-number">{sortedIndex + 1}</div>
                <img 
                  src={image.preview} 
                  alt={`选中图片 ${idx + 1}`} 
                  onError={onImageError}
                />
                <div className="selected-filename">{image.file.displayName || image.file.name}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default SelectedImagesPreview; 