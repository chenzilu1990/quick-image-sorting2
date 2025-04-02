import { ImageFile } from '../types';

interface UploadResult {
  success: boolean;
  url?: string;
  message?: string;
}

declare const uploadService: {
  uploadBatch: (images: ImageFile[]) => Promise<UploadResult[]>;
};

export default uploadService; 