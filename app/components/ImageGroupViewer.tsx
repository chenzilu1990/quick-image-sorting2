'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ImageFile } from '@/types';
import { useDictionary } from '@/components/client-dictionary';
import { Locale } from '@/i18n/settings';
import { Button } from '../../components/ui/Button';

interface UploadResult {
  status: 'uploading' | 'success' | 'error' | 'partial';
  message?: string;
  results?: Array<{success: boolean}>;
}

interface UploadResultsMap {
  [key: string]: UploadResult;
}

interface ImageGroup {
  prefix: string;
  time: string;
  images: ImageFile[];
}

interface ImageGroupViewerProps {
  groups: [string, ImageGroup][];
  uploadResults: UploadResultsMap;
  isDownloading: boolean;
  isUploading: boolean;
  isProcessingComfyUI: boolean;
  currentEditingImage: ImageFile | null;
  hasConfig: boolean;
  hasComfyUIConfig: boolean;
  lang: Locale;
  onDownloadGroup: (images: ImageFile[]) => void;
  onUploadGroup: (groupKey: string, images: ImageFile[]) => void;
  onOpenWorkflowModal: (image: ImageFile) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const ImageGroupViewer: React.FC<ImageGroupViewerProps> = ({
  groups,
  uploadResults,
  isDownloading,
  isUploading,
  isProcessingComfyUI,
  currentEditingImage,
  hasConfig,
  hasComfyUIConfig,
  lang,
  onDownloadGroup,
  onUploadGroup,
  onOpenWorkflowModal,
  onImageError
}) => {
  const dict = useDictionary();
  const pathname = usePathname();
  
  return (
    <div className="renamed-images-section">
      <h3>{dict.home.renamedImagesTitle}</h3>
      
      {groups.map(([groupKey, group]) => (
        <div key={groupKey} className="renamed-group">
          <div className="renamed-group-header">
            <div>
              <span className="renamed-group-prefix">{group.prefix}</span>
              <span className="renamed-group-time">({group.time})</span>
            </div>
            
            <div className="group-actions flex gap-2">
              <Button 
                variant="warning" 
                size="sm"
                onClick={() => onDownloadGroup(group.images)}
                disabled={isDownloading}
              >
                {isDownloading ? dict.status.downloading : dict.buttons.downloadGroup}
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => onUploadGroup(groupKey, group.images)}
                disabled={isUploading || !hasConfig}
                title={!hasConfig ? dict.alerts.uploadConfig : ''}
              >
                {uploadResults[groupKey]?.status === 'uploading'
                  ? dict.status.uploading
                  : dict.buttons.uploadToCloud}
              </Button>
            </div>
          </div>
          
          <div className="renamed-images-grid">
            {group.images.map((image: ImageFile) => (
              <div key={image.id} className="renamed-image-item">
                {uploadResults[groupKey] && (
                  <div className={`upload-status ${uploadResults[groupKey].status}`}>
                    <div className="upload-status-content">
                      {uploadResults[groupKey].status === 'uploading' && dict.status.uploading}
                      {uploadResults[groupKey].status === 'success' && dict.status.uploadSuccess}
                      {uploadResults[groupKey].status === 'partial' && uploadResults[groupKey].message}
                      {uploadResults[groupKey].status === 'error' && `✗ ${uploadResults[groupKey].message}`}
                    </div>
                  </div>
                )}
                
                {isProcessingComfyUI && currentEditingImage && currentEditingImage.id === image.id && (
                  <div className="processing-indicator">
                    <div className="spinner"></div>
                    <div>{dict.status.processing}</div>
                  </div>
                )}
                
                <img 
                  src={image.preview} 
                  alt={image.file.displayName || image.file.name} 
                  onError={onImageError}
                />
                <div className="renamed-filename">{image.file.displayName || image.file.name}</div>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full !rounded-t-none"
                  onClick={() => onOpenWorkflowModal(image)}
                  disabled={!hasConfig || isProcessingComfyUI}
                  title={!hasConfig ? dict.alerts.comfyUIConfig : ''}
                >
                  {dict.buttons.editWithComfyUI}
                </Button>
              </div>
            ))}
          </div>
          
          {!hasConfig && (
            <div className="config-missing">
              {dict.alerts.configUpload} 
              <Link href={`/${lang}/config`} className="config-link">
                <span>{dict.buttons.proceed}</span>
              </Link>
            </div>
          )}
          
          {!hasComfyUIConfig && (
            <div className="config-missing">
              {dict.alerts.configComfyUI} 
              <Link href={`/${lang}/config/comfyui`} className="config-link">
                <span>{dict.buttons.proceed}</span>
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGroupViewer; 