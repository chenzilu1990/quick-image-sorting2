'use client';

import React, { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { ImageFile } from '../types';

// 可排序网格引用类型
export interface SortableImageGridRef {
  resetSelection: () => void;
}

// 组件属性类型
interface SortableImageGridProps {
  images: ImageFile[];
  setImages: (images: ImageFile[] | ((prevState: ImageFile[]) => ImageFile[])) => void;
  onSelectedChange?: (selectedIds: string[]) => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

// 拖拽项属性
interface DraggableImageProps {
  image: ImageFile;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  isSelected: boolean;
  selectionIndex?: number;
  onToggleSelect: (id: string) => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

// 拖拽项组件
const DraggableImage: React.FC<DraggableImageProps> = ({ 
  image, 
  index, 
  moveImage, 
  isSelected, 
  selectionIndex, 
  onToggleSelect, 
  onImageError 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'IMAGE',
    item: () => ({ id: image.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'IMAGE',
    hover: (item: { id: string, index: number }, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // 不替换元素自身
      if (dragIndex === hoverIndex) return;
      
      // A rectangle on the screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Check if we have valid client offset
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the item's height
      
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      // Time to actually perform the action
      moveImage(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  
  // Initialize drag and drop refs
  drag(drop(ref));

  const handleClick = (e: React.MouseEvent) => {
    // Prevent drag and click from interfering with each other
    if (!isDragging) {
      onToggleSelect(image.id);
    }
  };

  // Get display name (use displayName if prefix has been applied)
  const displayName = image.file.displayName || image.file.name;

  return (
    <div 
      ref={ref} 
      className={`image-item ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <img 
        src={image.preview} 
        alt={`Preview ${index}`} 
        onError={onImageError}
      />
      {isSelected && (
        <div className="selected-indicator">
          <span>{selectionIndex}</span>
        </div>
      )}
      <div className="image-filename">
        {displayName}
      </div>
    </div>
  );
};

// 主图片网格组件
const SortableImageGrid = forwardRef<SortableImageGridRef, SortableImageGridProps>(
  ({ images, setImages, onSelectedChange, onImageError }, ref) => {
    // Use a Map to store selected images and their selection order
    const [selectedImageMap, setSelectedImageMap] = useState<Map<string, number>>(new Map());

    // Expose reset selection method to parent component
    useImperativeHandle(ref, () => ({
      resetSelection: () => {
        // Use functional update to ensure state is updated immediately
        setSelectedImageMap(() => new Map());
        // Notify parent component that selection has been cleared
        if (onSelectedChange) {
          onSelectedChange([]);
        }
      }
    }), [onSelectedChange]);

    // Notify parent component of selected image IDs, sorted by selection order
    const notifySelectedChange = useCallback((map: Map<string, number>) => {
      if (onSelectedChange) {
        // Convert Map to array and sort by value (selection order)
        const entries = Array.from(map.entries());
        entries.sort((a, b) => a[1] - b[1]);
        
        // Return sorted ID array
        const sortedIds = entries.map(entry => entry[0]);
        onSelectedChange(sortedIds);
      }
    }, [onSelectedChange]);

    // Notify parent component whenever selectedImageMap changes
    useEffect(() => {
      notifySelectedChange(selectedImageMap);
    }, [selectedImageMap, notifySelectedChange]);

    const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
      setImages((prevImages) => {
        const updatedImages = [...prevImages];
        [updatedImages[dragIndex], updatedImages[hoverIndex]] = 
        [updatedImages[hoverIndex], updatedImages[dragIndex]];
        return updatedImages;
      });
    }, [setImages]);

    const handleToggleSelect = useCallback((imageId: string) => {
      setSelectedImageMap(prevMap => {
        // Create a new Map to avoid directly modifying state
        const newMap = new Map(prevMap);
        
        if (newMap.has(imageId)) {
          // If already selected, deselect
          const removedIndex = newMap.get(imageId);
          newMap.delete(imageId);
          
          // Update indices of all images with indices greater than the removed image
          if (removedIndex !== undefined) {
            newMap.forEach((index, id) => {
              if (index > removedIndex) {
                newMap.set(id, index - 1);
              }
            });
          }
        } else {
          // If not selected, add to selection and assign next index
          newMap.set(imageId, newMap.size + 1);
        }
        
        return newMap;
      });
    }, []);

    return (
      <div className="image-grid">
        {images.map((image, index) => (
          <DraggableImage
            key={image.id}
            image={image}
            index={index}
            moveImage={moveImage}
            isSelected={selectedImageMap.has(image.id)}
            selectionIndex={selectedImageMap.get(image.id)}
            onToggleSelect={handleToggleSelect}
            onImageError={onImageError}
          />
        ))}
      </div>
    );
  }
);

SortableImageGrid.displayName = 'SortableImageGrid';

export default SortableImageGrid; 