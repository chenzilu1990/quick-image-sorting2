import { Dispatch, SetStateAction } from 'react';
import { ImageFile } from '@/types';

export interface SortableImageGridProps {
  images: ImageFile[];
  setImages: Dispatch<SetStateAction<ImageFile[]>>;
  onSelectedChange: (selectedIds: string[]) => void;
}

export interface SortableImageGridRef {
  resetSelection: () => void;
}

declare const SortableImageGrid: React.ForwardRefExoticComponent<
  SortableImageGridProps & React.RefAttributes<SortableImageGridRef>
>;

export default SortableImageGrid; 