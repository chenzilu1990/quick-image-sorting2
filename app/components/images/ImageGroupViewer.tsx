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
  results?: Array<{
    success: boolean;
    url?: string;
    originalImage?: ImageFile;
    message?: string;
  }>;
  urls?: Array<{name: string, url: string}>;
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
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<{[groupKey: string]: Set<string>}>({});
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  
  const getServiceForGroup = (groupKey: string) => {
    return selectedServices[groupKey] || defaultUploadService;
  };
  
  const handleServiceChange = (groupKey: string, serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [groupKey]: serviceId
    }));
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopiedUrl(url);
        // 2秒后清除复制状态
        setTimeout(() => setCopiedUrl(null), 2000);
      })
      .catch(err => console.error('复制失败:', err));
  };

  // 添加复制所有URL的函数
  const handleCopyAllUrls = (urls: Array<{name: string, url: string}>) => {
    if (!urls || urls.length === 0) return;
    
    // 格式化URL列表为易读的文本
    const formattedText = urls.map(item => `${item.name}: ${item.url}`).join('\n');
    
    navigator.clipboard.writeText(formattedText)
      .then(() => {
        setCopiedUrl('all');
        // 2秒后清除复制状态
        setTimeout(() => setCopiedUrl(null), 2000);
      })
      .catch(err => console.error('复制失败:', err));
  };

  // 通过图片ID查找其对应的URL
  const findImageUrl = (groupKey: string, imageId: string): string | null => {
    if (!uploadResults[groupKey]?.urls || !uploadResults[groupKey]?.results) return null;
    
    // 从results数组中找到对应图片的索引
    const resultIndex = uploadResults[groupKey].results.findIndex(
      r => r.originalImage?.id === imageId && r.success && r.url
    );
    
    if (resultIndex === -1) return null;
    
    // 获取对应的URL
    return uploadResults[groupKey].urls?.[resultIndex]?.url || null;
  };

  // 新增：切换图片选择
  const toggleImageSelection = (groupKey: string, imageId: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
    }
    
    setSelectedImageIds(prev => {
      const newState = { ...prev };
      if (!newState[groupKey]) {
        newState[groupKey] = new Set();
      }
      
      // 切换选择状态
      if (newState[groupKey].has(imageId)) {
        newState[groupKey].delete(imageId);
      } else {
        newState[groupKey].add(imageId);
      }
      
      return newState;
    });
  };

  // 新增：选择/取消选择一个组内所有图片
  const toggleGroupSelection = (groupKey: string, images: ImageFile[]) => {
    setSelectedImageIds(prev => {
      const newState = { ...prev };
      
      // 检查当前组是否已全选
      const isAllSelected = images.every(img => 
        newState[groupKey]?.has(img.id) && findImageUrl(groupKey, img.id)
      );
      
      // 如果全选了，则取消全选；否则全选
      if (isAllSelected) {
        newState[groupKey] = new Set();
      } else {
        newState[groupKey] = new Set(
          images
            .filter(img => findImageUrl(groupKey, img.id))  // 仅选择有URL的图片
            .map(img => img.id)
        );
      }
      
      return newState;
    });
    
    if (!selectionMode && images.some(img => findImageUrl(groupKey, img.id))) {
      setSelectionMode(true);
    }
  };

  // 新增：复制选中的图片链接
  const copySelectedImageUrls = (groupKey: string) => {
    if (!selectedImageIds[groupKey] || selectedImageIds[groupKey].size === 0) return;
    
    const selectedUrls: Array<{name: string, url: string}> = [];
    
    // 收集选中图片的URL
    const currentGroup = groups.find(([key]) => key === groupKey)?.[1];
    if (!currentGroup) return;
    
    currentGroup.images.forEach((image: ImageFile) => {
      if (selectedImageIds[groupKey]?.has(image.id)) {
        const url = findImageUrl(groupKey, image.id);
        if (url) {
          selectedUrls.push({
            name: image.file.displayName || image.file.name,
            url
          });
        }
      }
    });
    
    if (selectedUrls.length === 0) return;
    
    // 复制收集到的URL
    handleCopyAllUrls(selectedUrls);
  };

  // 新增：退出选择模式
  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedImageIds({});
  };

  // 新增：检查组中是否有选中的图片
  const hasSelectedImagesInGroup = (groupKey: string): boolean => {
    return selectedImageIds[groupKey]?.size > 0;
  };

  return (
    <div className="renamed-images-section my-8 p-6 bg-orange-50 rounded-lg border-2 border-orange-300 shadow-md space-y-6">
      <h3 className="text-xl font-semibold text-center text-orange-600">{dict.home.renamedImagesTitle}</h3>
      
      {/* 全局批量操作栏 */}
      {selectionMode && (
        <div className="sticky top-2 z-30 bg-blue-100 rounded-lg p-2 shadow-md border border-blue-300 flex justify-between items-center">
          <div className="text-blue-800 text-sm font-medium">
            已选择 {Object.values(selectedImageIds).reduce((acc, set) => acc + set.size, 0)} 张图片
          </div>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              onClick={() => {
                // 收集所有选中图片的URL
                const allSelectedUrls: Array<{name: string, url: string}> = [];
                groups.forEach(([groupKey, group]) => {
                  group.images.forEach(image => {
                    if (selectedImageIds[groupKey]?.has(image.id)) {
                      const url = findImageUrl(groupKey, image.id);
                      if (url) {
                        allSelectedUrls.push({
                          name: image.file.displayName || image.file.name,
                          url
                        });
                      }
                    }
                  });
                });
                handleCopyAllUrls(allSelectedUrls);
              }}
            >
              复制所有选中链接
            </button>
            <button 
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              onClick={exitSelectionMode}
            >
              取消选择
            </button>
          </div>
        </div>
      )}
      
      {groups.map(([groupKey, group]) => (
        <div key={groupKey} className="renamed-group border-b border-dashed border-orange-300 pb-6 last:border-b-0 last:pb-0">
          <div className="renamed-group-header flex justify-between items-center mb-3 p-2 bg-orange-50 rounded border-l-4 border-orange-500">
            <div className="flex-1 overflow-hidden mr-2 flex items-center">
              {/* 组批量选择复选框 */}
              {uploadResults[groupKey]?.status === 'success' || uploadResults[groupKey]?.status === 'partial' ? (
                <button 
                  className="mr-2 p-1 rounded hover:bg-orange-200"
                  onClick={() => toggleGroupSelection(groupKey, group.images)}
                  title={selectedImageIds[groupKey]?.size === group.images.length ? "取消全选" : "全选"}
                >
                  <div className={`w-5 h-5 rounded border ${
                    selectedImageIds[groupKey]?.size === group.images.filter(img => findImageUrl(groupKey, img.id)).length 
                      ? 'bg-blue-600 border-blue-600' 
                      : selectedImageIds[groupKey]?.size > 0 
                        ? 'bg-blue-300 border-blue-400' 
                        : 'border-gray-400'
                  } flex items-center justify-center`}>
                    {selectedImageIds[groupKey]?.size > 0 && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </button>
              ) : null}
              
              <span className="renamed-group-prefix font-bold text-orange-800 mr-2 truncate">{group.prefix}</span>
              <span className="renamed-group-time text-sm text-gray-600 mr-4">({group.time})</span>
            </div>
            
            <div className="group-actions flex gap-2 flex-shrink-0">
              {/* 选择模式下的组复制按钮 */}
              {selectionMode && hasSelectedImagesInGroup(groupKey) && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => copySelectedImageUrls(groupKey)}
                  title="复制选中图片的链接"
                >
                  {copiedUrl === 'all' ? '已复制链接' : `复制选中链接(${selectedImageIds[groupKey]?.size || 0})`}
                </Button>
              )}
              
              {/* 非选择模式下的组复制按钮 */}
              {!selectionMode && uploadResults[groupKey]?.status === 'success' && uploadResults[groupKey]?.urls && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => handleCopyAllUrls(uploadResults[groupKey].urls || [])}
                  title="复制所有链接"
                >
                  {copiedUrl === 'all' ? '已复制全部链接' : '复制全部链接'}
                </Button>
              )}
              
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
            {group.images.map((image: ImageFile) => {
              // 查找该图片的上传URL
              const imageUrl = findImageUrl(groupKey, image.id);
              const isSuccess = uploadResults[groupKey]?.status === 'success' || 
                               (uploadResults[groupKey]?.status === 'partial' && imageUrl);
              const isSelected = selectedImageIds[groupKey]?.has(image.id);
              
              return (
                <div 
                  key={image.id} 
                  className={`relative flex-shrink-0 w-44 rounded-lg overflow-hidden shadow transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg pb-10 ${
                    isSelected ? 'ring-4 ring-blue-500 border border-blue-500' : 'border border-gray-200'
                  }`}
                >
                  {/* 选择模式下的复选框 */}
                  {isSuccess && selectionMode && (
                    <div 
                      className="absolute top-2 left-2 z-30 w-6 h-6 bg-white rounded-full shadow-md cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (imageUrl) {
                          toggleImageSelection(groupKey, image.id);
                        }
                      }}
                    >
                      <div className={`w-full h-full rounded-full flex items-center justify-center border-2 ${
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                  )}
                  
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
                  
                  <div 
                    className="relative"
                    onClick={() => {
                      if (selectionMode && imageUrl) {
                        toggleImageSelection(groupKey, image.id);
                      }
                    }}
                  >
                    <img 
                      src={image.preview} 
                      alt={image.file.displayName || image.file.name} 
                      onError={onImageError}
                      className={`block w-full h-40 object-cover ${selectionMode && imageUrl ? 'cursor-pointer' : ''}`}
                    />
                    
                    {/* 如果图片已上传成功并有URL，则显示复制链接按钮 */}
                    {isSuccess && imageUrl && !selectionMode && (
                      <div className="absolute top-2 right-2 z-20">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(imageUrl);
                          }}
                          className={`p-1.5 rounded-full shadow-md ${
                            copiedUrl === imageUrl 
                              ? 'bg-green-500 text-white' 
                              : 'bg-white text-blue-600 hover:bg-blue-100'
                          }`}
                          title={copiedUrl === imageUrl ? '已复制链接' : '复制图片链接'}
                        >
                          {copiedUrl === imageUrl ? '✓' : '复制'}
                        </button>
                      </div>
                    )}
                    
                    {/* 在图片上显示链接 - 悬浮时可见的提示框 */}
                    {isSuccess && imageUrl && (
                      <div className="absolute top-0 left-0 right-0 bg-green-100 p-2 bg-opacity-90 text-xs text-green-800 opacity-0 hover:opacity-100 transition-opacity duration-200 z-20 overflow-hidden">
                        <p className="font-medium mb-1">图片链接:</p>
                        <div className="overflow-x-auto whitespace-nowrap pb-1 max-w-full">
                          <span className="cursor-pointer hover:text-green-600" onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(imageUrl);
                          }}>
                            {imageUrl}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 显示图片名称 */}
                  <div className="absolute bottom-10 left-0 right-0 bg-black bg-opacity-70 text-white px-2 py-1 text-xs truncate z-10">
                    {image.file.displayName || image.file.name}
                  </div>
                  
                  <Button 
                    variant={imageUrl ? "success" : "secondary"}
                    size="sm" 
                    className="absolute bottom-0 left-0 right-0 w-full rounded-t-none"
                    onClick={() => {
                      if (selectionMode && imageUrl) {
                        toggleImageSelection(groupKey, image.id);
                      } else if (imageUrl) {
                        handleCopyUrl(imageUrl);
                      } else {
                        onOpenWorkflowModal(image);
                      }
                    }}
                    disabled={(!imageUrl && (!hasComfyUIConfig || isProcessingComfyUI))}
                    title={imageUrl 
                      ? (selectionMode ? "选择/取消选择此图片" : "复制图片链接") 
                      : (!hasComfyUIConfig ? dict.alerts.comfyUIConfig : '')}
                  >
                    {selectionMode 
                      ? (isSelected ? "取消选择" : "选择此图片") 
                      : (imageUrl 
                        ? (copiedUrl === imageUrl ? '已复制链接' : '复制链接') 
                        : dict.buttons.editWithComfyUI)}
                  </Button>
                </div>
              );
            })}
          </div>
          
          {/* 组操作按钮 */}
          {(uploadResults[groupKey]?.status === 'success' || uploadResults[groupKey]?.status === 'partial') && (
            <div className="flex justify-end mt-3">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setSelectionMode(!selectionMode)}
              >
                {selectionMode ? '退出选择模式' : '选择图片批量复制'}
              </Button>
            </div>
          )}
          
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