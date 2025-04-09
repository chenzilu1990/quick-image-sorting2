'use client';

import React from 'react';
import Link from 'next/link';
import type { ImageFile } from '../../types';

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
  onDownloadGroup,
  onUploadGroup,
  onOpenWorkflowModal,
  onImageError
}) => {
  return (
    <div className="renamed-images-section">
      <h3>已重命名的图片</h3>
      
      {groups.map(([groupKey, group]) => (
        <div key={groupKey} className="renamed-group">
          <div className="renamed-group-header">
            <div>
              <span className="renamed-group-prefix">{group.prefix}</span>
              <span className="renamed-group-time">({group.time})</span>
            </div>
            
            <div className="group-actions">
              <button 
                className="group-download-btn"
                onClick={() => onDownloadGroup(group.images)}
                disabled={isDownloading}
              >
                {isDownloading ? '下载中...' : '下载此组'}
              </button>
              
              <button 
                className="upload-group-btn"
                onClick={() => onUploadGroup(groupKey, group.images)}
                disabled={isUploading || !hasConfig}
                title={!hasConfig ? '请先配置上传服务' : ''}
              >
                <span className="icon">☁️</span>
                {uploadResults[groupKey]?.status === 'uploading'
                  ? '上传中...'
                  : '上传到云'}
              </button>
            </div>
          </div>
          
          <div className="renamed-images-grid">
            {group.images.map((image: ImageFile) => (
              <div key={image.id} className="renamed-image-item">
                {uploadResults[groupKey] && (
                  <div className={`upload-status ${uploadResults[groupKey].status}`}>
                    <div className="upload-status-content">
                      {uploadResults[groupKey].status === 'uploading' && '上传中...'}
                      {uploadResults[groupKey].status === 'success' && '✓ 上传成功'}
                      {uploadResults[groupKey].status === 'partial' && uploadResults[groupKey].message}
                      {uploadResults[groupKey].status === 'error' && `✗ ${uploadResults[groupKey].message}`}
                    </div>
                  </div>
                )}
                
                {isProcessingComfyUI && currentEditingImage && currentEditingImage.id === image.id && (
                  <div className="processing-indicator">
                    <div className="spinner"></div>
                    <div>正在处理...</div>
                  </div>
                )}
                
                <img 
                  src={image.preview} 
                  alt={image.file.displayName || image.file.name} 
                  onError={onImageError}
                />
                <div className="renamed-filename">{image.file.displayName || image.file.name}</div>
                
                {/* 添加ComfyUI编辑按钮 */}
                <button 
                  className="edit-comfyui-btn"
                  onClick={() => onOpenWorkflowModal(image)}
                  disabled={!hasComfyUIConfig || isProcessingComfyUI}
                  title={!hasComfyUIConfig ? '请先配置ComfyUI服务' : '使用ComfyUI编辑图片'}
                >
                  <span className="icon">🎨</span> 使用ComfyUI编辑
                </button>
              </div>
            ))}
          </div>
          
          {!hasConfig && (
            <div className="config-missing">
              上传功能需要先配置云服务。 
              <Link href="/config" className="config-link">
                <span>前往配置</span>
              </Link>
            </div>
          )}
          
          {!hasComfyUIConfig && (
            <div className="config-missing">
              编辑功能需要先配置ComfyUI。 
              <Link href="/config/comfyui" className="config-link">
                <span>前往配置</span>
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageGroupViewer; 