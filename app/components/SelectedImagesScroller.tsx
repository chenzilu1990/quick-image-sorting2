'use client';

import React, { useRef, useEffect } from 'react';
import type { ImageFile } from '../types';

interface SelectedImagesScrollerProps {
  selectedCount: number;
  selectedImagesIds: string[];
  images: ImageFile[];
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClearSelection?: () => void;
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
  onClearSelection
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

  return (
    <div className="scroller-container">
      <style jsx>{`
        .scroller-container {
          position: fixed;
          bottom: 0;
          right: 0;
          left: 240px;
          background-color: #f0f8ff;
          border-top: 2px solid #2196f3;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          z-index: 950;
          height: 180px;
          overflow: hidden; /* 禁止容器自身滚动 */
        }
        
        .scroller-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          height: 30px; /* 固定标题高度 */
        }
        
        .scroller-title {
          margin: 0;
          color: #2196f3;
          font-size: 16px;
        }
        
        .scroller-content {
          width: 100%;
          overflow-x: auto; /* 只允许水平滚动 */
          overflow-y: hidden !important; /* 强制禁止垂直滚动 */
          white-space: nowrap;
          height: 130px;
          display: flex; /* 使用flex布局 */
          flex-direction: row; /* 强制一行 */
          flex-wrap: nowrap; /* 禁止换行 */
          align-items: center; /* 垂直居中 */
          scrollbar-width: thin;
          scrollbar-color: #2196f3 #e6f7ff;
          -webkit-overflow-scrolling: touch; /* 平滑触摸滚动 */
        }
        
        .thumbnail {
          flex: 0 0 120px; /* 禁止缩放，固定宽度 */
          width: 120px;
          height: 120px;
          margin-right: 15px;
          position: relative;
          border: 2px solid #2196f3;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .number-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 24px;
          height: 24px;
          background-color: #2196f3;
          color: white;
          font-weight: bold;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        
        .filename {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 5px;
          font-size: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .clear-button {
          background-color: #e0e0e0;
          color: #424242;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
        }
        
        .clear-button:hover {
          background-color: #bdbdbd;
        }
        
        @media (max-width: 768px) {
          .scroller-container {
            left: 200px;
          }
        }

        /* 滚动条样式 */
        .scroller-content::-webkit-scrollbar {
          height: 8px;
          width: 0; /* 隐藏垂直滚动条 */
        }
        
        .scroller-content::-webkit-scrollbar-track {
          background: #e6f7ff;
          border-radius: 4px;
        }
        
        .scroller-content::-webkit-scrollbar-thumb {
          background-color: #2196f3;
          border-radius: 4px;
        }
      `}</style>
      
      <div className="scroller-header">
        <h3 className="scroller-title">已选择 {selectedCount} 张图片</h3>
        {onClearSelection && (
          <button 
            onClick={onClearSelection}
            className="clear-button"
          >
            清除选择
          </button>
        )}
      </div>
      
      <div className="scroller-content" ref={scrollContainerRef}>
        {selectedImages.map((image, idx) => (
          <div key={image.id} className="thumbnail">
            <div className="number-badge">{idx + 1}</div>
            <img 
              src={image.preview} 
              alt={`选中图片 ${idx + 1}`} 
              onError={onImageError}
            />
            <div className="filename">{image.file.displayName || image.file.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedImagesScroller; 