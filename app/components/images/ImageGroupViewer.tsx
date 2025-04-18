'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ImageFile } from '@/types';
import { useDictionary } from '@/components/hooks/client-dictionary';
import { Locale } from '@/i18n/settings';
import { Button } from '@/components/ui/Button';

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
  onUploadGroup: (groupKey: string, images: ImageFile[], serviceId: string) => void;
  onOpenWorkflowModal: (image: ImageFile) => void;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  availableServices: Array<{id: string, name: string}>;
  defaultUploadService: string;
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
  onImageError,
  availableServices = [{ id: 'default', name: '默认' }],
  defaultUploadService = 'default',
}) => {
  const dict = useDictionary();
  const pathname = usePathname();
  
  const [selectedServices, setSelectedServices] = useState<{[key: string]: string}>({});
  
  const getServiceForGroup = (groupKey: string) => {
    return selectedServices[groupKey] || defaultUploadService;
  };
  
  const handleServiceChange = (groupKey: string, serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [groupKey]: serviceId
    }));
  };

  return (
    <div className="renamed-images-section my-8 p-6 bg-orange-50 rounded-lg border-2 border-orange-300 shadow-md space-y-6">
      <h3 className="text-xl font-semibold text-center text-orange-600">{dict.home.renamedImagesTitle}</h3>
      
      {groups.map(([groupKey, group]) => (
        <div key={groupKey} className="renamed-group border-b border-dashed border-orange-300 pb-6 last:border-b-0 last:pb-0">
          <div className="renamed-group-header flex justify-between items-center mb-3 p-2 bg-orange-50 rounded border-l-4 border-orange-500">
            <div className="flex-1 overflow-hidden mr-2">
              <span className="renamed-group-prefix font-bold text-orange-800 mr-2 truncate">{group.prefix}</span>
              <span className="renamed-group-time text-sm text-gray-600 mr-4">({group.time})</span>
            </div>
            
            <div className="group-actions flex gap-2 flex-shrink-0">
              <Button 
                variant="warning" 
                size="sm"
                onClick={() => onDownloadGroup(group.images)}
                disabled={isDownloading}
              >
                {isDownloading ? dict.status.downloading : dict.buttons.downloadGroup}
              </Button>
              
              <div className="flex items-center">
                <select 
                  value={getServiceForGroup(groupKey)}
                  onChange={(e) => handleServiceChange(groupKey, e.target.value)}
                  disabled={isUploading || !hasConfig}
                  className="mr-2 p-1 text-sm border border-gray-300 rounded"
                  title={dict.buttons.selectService || "选择上传服务"}
                >
                  {Array.isArray(availableServices) && availableServices.length > 0 
                    ? availableServices.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))
                    : <option value="default">默认</option>
                  }
                </select>
                
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => onUploadGroup(groupKey, group.images, getServiceForGroup(groupKey))}
                  disabled={isUploading || !hasConfig}
                  title={!hasConfig ? dict.alerts.uploadConfig : ''}
                >
                  {uploadResults[groupKey]?.status === 'uploading'
                    ? dict.status.uploading
                    : dict.buttons.uploadToCloud}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="renamed-images-grid flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
            {group.images.map((image: ImageFile) => (
              <div key={image.id} className="relative flex-shrink-0 w-44 rounded-lg border border-gray-200 overflow-hidden shadow transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg pb-10">
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
                  className="block w-full h-40 object-cover"
                />
                <div className="absolute bottom-10 left-0 right-0 bg-black bg-opacity-70 text-white px-2 py-1 text-xs truncate z-10">{image.file.displayName || image.file.name}</div>
                
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="absolute bottom-0 left-0 right-0 w-full rounded-t-none"
                  onClick={() => onOpenWorkflowModal(image)}
                  disabled={!hasComfyUIConfig || isProcessingComfyUI}
                  title={!hasComfyUIConfig ? dict.alerts.comfyUIConfig : ''}
                >
                  {dict.buttons.editWithComfyUI}
                </Button>
              </div>
            ))}
          </div>
          
          {!hasConfig && (
            <div className="config-missing mt-2 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
              {dict.alerts.configUpload} 
              <Link href={`/${lang}/config`} className="config-link ml-1 font-medium text-blue-600 hover:underline">
                <span>{dict.buttons.proceed}</span>
              </Link>
            </div>
          )}
          
          {!hasComfyUIConfig && (
            <div className="config-missing mt-2 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
              {dict.alerts.configComfyUI} 
              <Link href={`/${lang}/config/comfyui`} className="config-link ml-1 font-medium text-blue-600 hover:underline">
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