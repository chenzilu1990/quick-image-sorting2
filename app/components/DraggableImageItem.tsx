'use client';

import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { ImageFile } from '../types';

// 图片项类型
const ItemType = 'IMAGE';

// 组件属性接口
interface DraggableImageProps {
  image: ImageFile;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  isSelected: boolean;
  toggleSelection: (e: React.MouseEvent, id: string) => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * 可拖拽图片项组件
 * 
 * 用于在SortableImageGrid中展示单个可拖拽、可选择的图片
 */
const DraggableImage: React.FC<DraggableImageProps> = ({ 
  image, 
  index, 
  moveImage, 
  isSelected, 
  toggleSelection, 
  onImageError 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: image.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { id: string, index: number }, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      
      // 根据鼠标位置决定是向上还是向下移动
      const isUpward = dragIndex > hoverIndex && hoverClientY > hoverMiddleY;
      const isDownward = dragIndex < hoverIndex && hoverClientY < hoverMiddleY;
      const isLeftward = dragIndex > hoverIndex && hoverClientX > hoverMiddleX;
      const isRightward = dragIndex < hoverIndex && hoverClientX < hoverMiddleX;
      
      if (isUpward || isDownward || isLeftward || isRightward) return;
      
      moveImage(dragIndex, hoverIndex);
      
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div
      ref={ref}
      className={`image-item ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={(e) => toggleSelection(e, image.id)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      data-index={index}
    >
      <div className="index-badge">{index + 1}</div>
      <img 
        src={image.preview} 
        alt={image.file.displayName || image.file.name} 
        onError={onImageError}
      />
      <div className="filename">{image.file.displayName || image.file.name}</div>
    </div>
  );
};

export default DraggableImage; 