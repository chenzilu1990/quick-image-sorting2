import { ReactNode, RefObject } from 'react';
import { ImageFile } from '@/types';

export interface ImageDropzoneProps {
  onImagesDrop: (images: ImageFile[]) => void;
  children?: ReactNode;
}

export interface ImageDropzoneRef {
  openFileDialog: () => void;
}

declare const ImageDropzone: React.ForwardRefExoticComponent<
  ImageDropzoneProps & React.RefAttributes<ImageDropzoneRef>
>;

export default ImageDropzone; 