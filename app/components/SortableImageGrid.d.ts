import { Dispatch, SetStateAction, SyntheticEvent } from 'react';
import { ImageFile } from '@/types';

export interface SortableImageGridProps {
  images: ImageFile[];
  setImages: Dispatch<SetStateAction<ImageFile[]>>;
  onSelectedChange: (selectedIds: string[]) => void;
  onImageError?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
}

export interface SortableImageGridRef {
  resetSelection: () => void;
}

declare const SortableImageGrid: React.ForwardRefExoticComponent<
  SortableImageGridProps & React.RefAttributes<SortableImageGridRef>
>;

export default SortableImageGrid; 