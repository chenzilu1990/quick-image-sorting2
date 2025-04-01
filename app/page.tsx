'use client';

import { useState, useCallback, useRef, useEffect, MouseEvent, RefObject } from 'react';
import ImageDropzone, { ImageDropzoneRef } from './components/ImageDropzone';
import SortableImageGrid, { SortableImageGridRef } from './components/SortableImageGrid';
import JSZip from 'jszip';
import './globals.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Link from 'next/link';
import uploadService from './services/uploadService';
import comfyuiService from './services/comfyuiService';  // 导入ComfyUI服务
import comfyUIMessageService from './services/comfyuiMessageService';  // 导入新的消息服务
import type { ImageFile, Workflow } from '@/types';

// 上传结果类型定义
interface UploadResult {
  status: 'uploading' | 'success' | 'error' | 'partial';
  message?: string;
  results?: Array<{success: boolean}>;
}

// 上传结果集合类型
interface UploadResultsMap {
  [key: string]: UploadResult;
}

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const selectedImagesRef = useRef<string[]>([]);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [prefix, setPrefix] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const gridRef = useRef<SortableImageGridRef>(null);
  const [renamedImages, setRenamedImages] = useState<ImageFile[]>([]);
  const imageDropzoneRef = useRef<ImageDropzoneRef>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResults, setUploadResults] = useState<UploadResultsMap>({});
  const [hasConfig, setHasConfig] = useState<boolean>(false);
  const [hasComfyUIConfig, setHasComfyUIConfig] = useState<boolean>(false);
  const [isProcessingComfyUI, setIsProcessingComfyUI] = useState<boolean>(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState<boolean>(false);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [currentEditingImage, setCurrentEditingImage] = useState<ImageFile | null>(null);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false); // 标记是否已加载图片

  // 接收选中图片的回调
  const handleSelectedImagesChange = useCallback((selectedIds: string[]) => {
    selectedImagesRef.current = selectedIds;
    setSelectedCount(selectedIds.length);
  }, []);

  // 将图片转换为base64编码，并检查大小
  const imageToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      // 预估转换为base64后的大小 (原始大小 * 4/3 + 一些头信息)
      const estimatedSize = Math.ceil(blob.size * 1.37);
      const sizeInMB = estimatedSize / (1024 * 1024);
      
      // 如果单个图片超过2MB，发出警告
      if (sizeInMB > 2) {
        console.warn(`图片过大: ${sizeInMB.toFixed(2)}MB，可能导致存储失败`);
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('转换图片为base64失败:', error);
      return '';
    }
  };

  // 检查localStorage可用空间
  const getLocalStorageRemainingSpace = (): number => {
    let total = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        const value = localStorage.getItem(key) || '';
        total += key.length + value.length;
      }
      // 预估可用容量 (5MB - 已用空间)
      return 5 * 1024 * 1024 - total;
    } catch (e) {
      console.error('计算localStorage剩余空间出错:', e);
      return 0;
    }
  };

  // 保存图片数据到localStorage
  const saveImagesToStorage = useCallback(async (imgList: ImageFile[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      // 检查localStorage剩余空间
      const remainingSpace = getLocalStorageRemainingSpace();
      const remainingSpaceMB = remainingSpace / (1024 * 1024);
      console.log(`localStorage剩余空间: 约${remainingSpaceMB.toFixed(2)}MB`);
      
      // 创建转换所有图片为base64的Promise数组
      const base64Promises = imgList.map(async (img) => {
        // 如果图片已经是base64格式，直接使用
        if (img.preview.startsWith('data:')) {
          return {
            id: img.id,
            preview: img.preview,
            file: {
              name: img.file.name,
              displayName: img.file.displayName,
              size: img.file.size,
              type: img.file.type
            },
            group: img.group
          };
        }
        
        try {
          // 将blob URL转为base64
          const base64Data = await imageToBase64(img.preview);
          return {
            id: img.id,
            preview: base64Data, // 保存base64数据
            file: {
              name: img.file.name,
              displayName: img.file.displayName,
              size: img.file.size,
              type: img.file.type
            },
            group: img.group
          };
        } catch (error) {
          console.error(`图片 ${img.file.name} 转换失败:`, error);
          // 返回没有preview的对象，避免整个操作失败
          return {
            id: img.id,
            preview: '', // 空预览
            file: {
              name: img.file.name,
              displayName: img.file.displayName,
              size: img.file.size,
              type: img.file.type
            },
            group: img.group
          };
        }
      });
      
      // 等待所有图片转换完成
      const imageData = await Promise.all(base64Promises);
      
      // 过滤掉没有预览的图片
      const validImageData = imageData.filter(img => img.preview);
      
      if (validImageData.length !== imageData.length) {
        console.warn(`${imageData.length - validImageData.length} 张图片未能成功保存`);
      }
      
      try {
        // 尝试保存到localStorage
        const dataString = JSON.stringify(validImageData);
        const sizeInMB = dataString.length / (1024 * 1024);
        
        // 如果数据过大，给出提示
        if (sizeInMB > remainingSpaceMB) {
          alert(`警告：图片数据大小(${sizeInMB.toFixed(2)}MB)超过localStorage剩余空间(${remainingSpaceMB.toFixed(2)}MB)，图片状态可能无法保存！`);
        }
        
        localStorage.setItem('savedImages', dataString);
        console.log(`成功保存图片数据: ${sizeInMB.toFixed(2)}MB`);
      } catch (storageError) {
        console.error('存储到localStorage失败:', storageError);
        alert('图片数据过大，无法保存！请减少图片数量或使用较小的图片。');
      }
    } catch (error) {
      console.error('保存图片数据失败:', error);
      alert('保存图片数据失败，可能是因为图片过大。');
    }
  }, []);

  // 保存重命名图片数据到localStorage
  const saveRenamedImagesToStorage = useCallback(async (imgList: ImageFile[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      // 检查localStorage剩余空间
      const remainingSpace = getLocalStorageRemainingSpace();
      const remainingSpaceMB = remainingSpace / (1024 * 1024);
      
      // 创建转换所有图片为base64的Promise数组
      const base64Promises = imgList.map(async (img) => {
        // 如果图片已经是base64格式，直接使用
        if (img.preview.startsWith('data:')) {
          return {
            id: img.id,
            preview: img.preview,
            file: {
              name: img.file.name,
              displayName: img.file.displayName,
              size: img.file.size,
              type: img.file.type
            },
            group: img.group,
            isRenamed: (img as any).isRenamed,
            originalImageId: (img as any).originalImageId,
            prefix: (img as any).prefix,
            applyTime: (img as any).applyTime
          };
        }
        
        try {
          // 将blob URL转为base64
          const base64Data = await imageToBase64(img.preview);
          return {
            id: img.id,
            preview: base64Data, // 保存base64数据
            file: {
              name: img.file.name,
              displayName: img.file.displayName,
              size: img.file.size,
              type: img.file.type
            },
            group: img.group,
            isRenamed: (img as any).isRenamed,
            originalImageId: (img as any).originalImageId,
            prefix: (img as any).prefix,
            applyTime: (img as any).applyTime
          };
        } catch (error) {
          console.error(`重命名图片 ${img.file.name} 转换失败:`, error);
          // 返回没有preview的对象
          return {
            id: img.id,
            preview: '',
            file: {
              name: img.file.name,
              displayName: img.file.displayName,
              size: img.file.size,
              type: img.file.type
            },
            group: img.group,
            isRenamed: (img as any).isRenamed,
            originalImageId: (img as any).originalImageId,
            prefix: (img as any).prefix,
            applyTime: (img as any).applyTime
          };
        }
      });
      
      // 等待所有图片转换完成
      const imageData = await Promise.all(base64Promises);
      
      // 过滤掉没有预览的图片
      const validImageData = imageData.filter(img => img.preview);
      
      if (validImageData.length !== imageData.length) {
        console.warn(`${imageData.length - validImageData.length} 张重命名图片未能成功保存`);
      }
      
      try {
        // 尝试保存到localStorage
        const dataString = JSON.stringify(validImageData);
        const sizeInMB = dataString.length / (1024 * 1024);
        
        // 如果数据过大，给出提示
        if (sizeInMB > remainingSpaceMB) {
          alert(`警告：重命名图片数据大小(${sizeInMB.toFixed(2)}MB)超过localStorage剩余空间(${remainingSpaceMB.toFixed(2)}MB)，图片状态可能无法保存！`);
        }
        
        localStorage.setItem('savedRenamedImages', dataString);
        console.log(`成功保存重命名图片数据: ${sizeInMB.toFixed(2)}MB`);
      } catch (storageError) {
        console.error('存储重命名图片到localStorage失败:', storageError);
        alert('重命名图片数据过大，无法保存！请减少图片数量或使用较小的图片。');
      }
    } catch (error) {
      console.error('保存重命名图片数据失败:', error);
      alert('保存重命名图片数据失败，可能是因为图片过大。');
    }
  }, []);

  // 处理图片显示错误
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    // 设置为内联的数据URL作为占位符图像
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPuWbvueJh+aXoOazlei9rOWPkTwvdGV4dD48L3N2Zz4=';
    img.classList.add('broken-image');
  };

  // 从localStorage加载图片数据
  const loadImagesFromStorage = useCallback(() => {
    if (typeof window === 'undefined' || imagesLoaded) return;
    
    try {
      // 移除警告提示，因为我们现在使用base64，不会有图片失效问题
      
      const savedImagesJson = localStorage.getItem('savedImages');
      if (savedImagesJson) {
        const savedImagesData = JSON.parse(savedImagesJson);
        
        // 创建新的图片对象
        const restoredImages = savedImagesData.map((imgData: any) => {
          return {
            ...imgData,
            file: {
              ...imgData.file,
              size: imgData.file.size,
              type: imgData.file.type
            }
          } as ImageFile;
        });
        
        if (restoredImages.length > 0) {
          setImages(restoredImages);
        }
      }
      
      // 加载重命名的图片
      const savedRenamedImagesJson = localStorage.getItem('savedRenamedImages');
      if (savedRenamedImagesJson) {
        const savedRenamedImagesData = JSON.parse(savedRenamedImagesJson);
        
        // 创建新的图片对象
        const restoredRenamedImages = savedRenamedImagesData.map((imgData: any) => {
          return {
            ...imgData,
            file: {
              ...imgData.file,
              size: imgData.file.size,
              type: imgData.file.type
            }
          } as ImageFile;
        });
        
        if (restoredRenamedImages.length > 0) {
          setRenamedImages(restoredRenamedImages);
        }
      }
      
      setImagesLoaded(true); // 标记为已加载
    } catch (error) {
      console.error('加载保存的图片失败:', error);
    }
  }, [imagesLoaded]);

  // 修改handleImagesDrop函数，处理异步保存
  const handleImagesDrop = useCallback((newImages: ImageFile[]) => {
    if (!newImages || !Array.isArray(newImages) || newImages.length === 0) return;
    
    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    saveImagesToStorage(updatedImages);
  }, [images, saveImagesToStorage]);

  // 修改deleteSelected函数，处理异步保存
  const deleteSelected = useCallback(() => {
    if (selectedImagesRef.current.length === 0) return;
    
    // 释放被删除图片的预览URL
    const selectedIds = new Set(selectedImagesRef.current);
    const imagesToDelete = images.filter(img => selectedIds.has(img.id));
    
    imagesToDelete.forEach(image => {
      if (image && image.preview && image.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    });
    
    // 过滤掉选中的图片
    const updatedImages = images.filter(image => !selectedIds.has(image.id));
    setImages(updatedImages);
    saveImagesToStorage(updatedImages);
    
    // 先重置选中状态，确保UI立即更新
    if (gridRef.current) {
      gridRef.current.resetSelection();
    }
    
  }, [images, saveImagesToStorage]);

  // 修改applyPrefix函数，处理异步保存
  const applyPrefix = useCallback(() => {
    if (selectedImagesRef.current.length === 0 || !prefix.trim()) return;
    
    // 保存当前选中的图片ID，因为之后会重置选择状态
    const selectedIds = [...selectedImagesRef.current];
    
    // 获取选中图片及其选中顺序
    const selectedImagesToRename: Array<ImageFile & {selectionIndex: number}> = [];
    images.forEach(image => {
      if (selectedIds.includes(image.id)) {
        const index = selectedIds.indexOf(image.id);
        selectedImagesToRename.push({...image, selectionIndex: index});
      }
    });
    
    // 为选中图片创建重命名副本
    const newRenamedImages = selectedImagesToRename.map(image => {
      const selectedIndex = image.selectionIndex;
      let typeName = '';
      
      // 第一张图片为MAIN
      if (selectedIndex === 0) {
        typeName = 'MAIN';
      } 
      // 最后一张图片为SWITCH
      else if (selectedIndex === selectedImagesToRename.length - 1) {
        typeName = 'SWITCH';
      } 
      // 中间图片为PT01到PT08
      else {
        const ptIndex = selectedIndex;
        typeName = `PT${String(ptIndex).padStart(2, '0')}`;
      }
      
      // 获取文件扩展名（优先使用已有的displayName，否则使用原始文件名）
      const sourceFileName = image.file.displayName || image.file.name;
      
      // 改进的扩展名提取方法
      let fileExt = '';
      const lastDotIndex = sourceFileName.lastIndexOf('.');
      if (lastDotIndex !== -1 && lastDotIndex > sourceFileName.lastIndexOf('/') && lastDotIndex > sourceFileName.lastIndexOf('\\')) {
        fileExt = sourceFileName.substring(lastDotIndex);
      }
      
      // 创建新名称
      const newDisplayName = `${prefix}.${typeName}${fileExt}`;
      
      // 创建新的图片对象
      return {
        ...image,
        id: `renamed-${image.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // 确保ID唯一
        file: {
          ...image.file,
          displayName: newDisplayName
        },
        isRenamed: true,
        originalImageId: image.id,
        prefix: prefix, // 保存使用的前缀
        applyTime: new Date().toLocaleString() // 保存应用时间，便于识别
      } as ImageFile;
    });
    
    // 更新重命名图片
    const updatedRenamedImages = [...renamedImages, ...newRenamedImages];
    setRenamedImages(updatedRenamedImages);
    saveRenamedImagesToStorage(updatedRenamedImages);
    
    // 状态更新后立即重置选择
    gridRef.current?.resetSelection();
    
  }, [prefix, images, renamedImages, saveRenamedImagesToStorage]);

  // 修改clearRenamedImages函数，清理base64图片
  const clearRenamedImages = useCallback(() => {
    if (renamedImages.length === 0) return;
    
    // 释放预览URL (仅blob URL)
    renamedImages.forEach(image => {
      if (image && image.preview && image.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    });
    
    setRenamedImages([]);
    localStorage.removeItem('savedRenamedImages');
  }, [renamedImages]);

  // 修改clearImages函数，清理base64图片
  const clearImages = useCallback(() => {
    if (images.length === 0) return;
    
    // 释放预览URL (仅blob URL)
    images.forEach(image => {
      if (image && image.preview && image.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    });
    setImages([]);
    localStorage.removeItem('savedImages');
  }, [images]);

  // 从localStorage加载图片数据的useEffect
  useEffect(() => {
    loadImagesFromStorage();
  }, [loadImagesFromStorage]);

  // 将图片URL转换为Blob对象
  const urlToBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  };

  // 批量下载选中的图片（打包成ZIP）
  const downloadSelectedImages = useCallback(async () => {
    if (selectedImagesRef.current.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      const selectedIds = new Set(selectedImagesRef.current);
      const selectedImages = images.filter(img => selectedIds.has(img.id));
      
      if (selectedImages.length === 0) {
        setIsDownloading(false);
        return;
      }
      
      // 创建一个新的JSZip实例
      const zip = new JSZip();
      
      // 添加图片到zip
      const promises = selectedImages.map(async (image) => {
        // 使用显示名称(如果有)或原始文件名
        const fileName = image.file.displayName || image.file.name;
        
        // 将图片URL转换为Blob
        try {
          const blob = await urlToBlob(image.preview);
          if (!blob) {
            console.error(`无法获取图片Blob: ${fileName}`);
            return;
          }
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`添加图片到ZIP出错: ${fileName}`, error);
        }
      });
      
      // 等待所有图片添加完成
      await Promise.all(promises);
      
      // 检查zip是否为空
      if (Object.keys(zip.files).length === 0) {
        throw new Error('没有可下载的图片');
      }
      
      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      if (!zipBlob || zipBlob.size === 0) {
        throw new Error('生成ZIP文件失败');
      }
      
      // 创建下载链接
      const href = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `${prefix || 'images'}_selected.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error: any) {
      console.error('批量下载图片出错:', error);
      alert(`批量下载图片时出错: ${error.message || '请重试'}`);
    } finally {
      setIsDownloading(false);
    }
  }, [images, prefix]);

  // 下载排序结果
  const downloadOrder = useCallback(() => {
    if (images.length === 0) return;
    
    // 创建文件名列表的文本
    const fileNames = images.map((image, index) => {
      // 如果已有显示名称，则使用它
      if (image.file.displayName) {
        return `${index + 1}. ${image.file.displayName}`;
      }
      
      // 否则使用原始名称
      return `${index + 1}. ${image.file.name}`;
    }).join('\n');
    
    // 创建blob并下载
    const blob = new Blob([fileNames], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = 'image-order.txt';
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }, [images]);

  // 下载重命名后的图片
  const downloadRenamedImages = useCallback(async () => {
    if (renamedImages.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      // 创建一个新的JSZip实例
      const zip = new JSZip();
      
      // 添加图片到zip
      const promises = renamedImages.map(async (image) => {
        // 使用新的显示名称
        const fileName = image.file.displayName || image.file.name;
        
        // 将图片URL转换为Blob
        try {
          const blob = await urlToBlob(image.preview);
          if (!blob) {
            console.error(`无法获取图片Blob: ${fileName}`);
            return;
          }
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`添加图片到ZIP出错: ${fileName}`, error);
        }
      });
      
      // 等待所有图片添加完成
      await Promise.all(promises);
      
      // 检查zip是否为空
      if (Object.keys(zip.files).length === 0) {
        throw new Error('没有可下载的图片');
      }
      
      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      if (!zipBlob || zipBlob.size === 0) {
        throw new Error('生成ZIP文件失败');
      }
      
      // 创建下载链接
      const href = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `${prefix || 'images'}_renamed.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error: any) {
      console.error('批量下载重命名图片出错:', error);
      alert(`批量下载重命名图片时出错: ${error.message || '请重试'}`);
    } finally {
      setIsDownloading(false);
    }
  }, [renamedImages, prefix]);

  // 修复类型错误
  const handleImageOrderChange = useCallback((newImages: ImageFile[] | ((prevState: ImageFile[]) => ImageFile[])) => {
    // 处理函数调用
    const updatedImages = typeof newImages === 'function' 
      ? newImages(images) 
      : newImages;
    
    setImages(updatedImages);
    saveImagesToStorage(updatedImages);
  }, [images, saveImagesToStorage]);

  // 下载特定组的重命名图片
  const downloadGroupImages = useCallback(async (groupImages: ImageFile[]) => {
    if (!groupImages || groupImages.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      // 创建一个新的JSZip实例
      const zip = new JSZip();
      
      // 添加图片到zip
      const promises = groupImages.map(async (image) => {
        // 使用新的显示名称
        const fileName = image.file.displayName || image.file.name;
        
        // 将图片URL转换为Blob
        try {
          const blob = await urlToBlob(image.preview);
          if (!blob) {
            console.error(`无法获取图片Blob: ${fileName}`);
            return;
          }
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`添加图片到ZIP出错: ${fileName}`, error);
        }
      });
      
      // 等待所有图片添加完成
      await Promise.all(promises);
      
      // 检查zip是否为空
      if (Object.keys(zip.files).length === 0) {
        throw new Error('没有可下载的图片');
      }
      
      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      if (!zipBlob || zipBlob.size === 0) {
        throw new Error('生成ZIP文件失败');
      }
      
      // 创建下载链接
      const href = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `${prefix || 'images'}_group.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (error: any) {
      console.error('批量下载组图片出错:', error);
      alert(`批量下载组图片时出错: ${error.message || '请重试'}`);
    } finally {
      setIsDownloading(false);
    }
  }, [prefix]);

  // 组件卸载时清理所有预览URL
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image && image.preview) URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  // 添加双击事件处理
  useEffect(() => {
    const mainElement = document.querySelector('main');
    
    // 监听双击事件
    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 排除一些不应该触发文件选择的元素
      const isButton = target.tagName === 'BUTTON';
      const isInput = target.tagName === 'INPUT';
      const isImage = target.tagName === 'IMG';
      const isLink = target.tagName === 'A';
      
      // 如果不是按钮、输入框、图片或链接，则可以触发文件选择
      if (!isButton && !isInput && !isImage && !isLink) {
        if (imageDropzoneRef.current) {
          imageDropzoneRef.current.openFileDialog();
        }
      }
    };
    
    // 为main元素添加双击事件
    if (mainElement) {
      mainElement.addEventListener('dblclick', handleDblClick as any);
    }
    
    return () => {
      if (mainElement) {
        mainElement.removeEventListener('dblclick', handleDblClick as any);
      }
    };
  }, []);

  // 检查是否有有效的上传配置
  useEffect(() => {
    try {
      const config = localStorage.getItem('imageUploaderConfig');
      if (config) {
        const parsedConfig = JSON.parse(config);
        const selectedService = parsedConfig.selectedService;
        
        if (
          (selectedService === 'github' && 
           parsedConfig.github && 
           parsedConfig.github.token && 
           parsedConfig.github.repo && 
           parsedConfig.github.owner) ||
          (selectedService === 'custom' && 
           parsedConfig.customServer && 
           parsedConfig.customServer.apiUrl)
        ) {
          setHasConfig(true);
        }
      }
    } catch (error) {
      console.error('检查配置时出错:', error);
    }
  }, []);

  // 检查ComfyUI配置
  useEffect(() => {
    try {
      const config = comfyuiService.getConfig();
      if (config && config.serverUrl) {
        setHasComfyUIConfig(true);
      }
    } catch (error) {
      console.error('检查ComfyUI配置时出错:', error);
    }
  }, []);

  // 加载ComfyUI工作流列表
  const loadWorkflows = async () => {
    if (!hasComfyUIConfig) return;
    
    setIsLoadingWorkflows(true);
    
    try {
      // 先测试连接
      const connectionTest = await comfyuiService.checkConnection();
      if (!connectionTest.status) {
        alert('无法连接到ComfyUI服务器，请检查配置和服务器状态');
        return;
      }
      
      // 获取工作流列表
      const workflows = await comfyuiService.getWorkflows();
      setAvailableWorkflows(workflows);
      
      // 如果有默认工作流，预选中
      const config = comfyuiService.getConfig();
      if (config.defaultWorkflow && workflows.some(w => w.id === config.defaultWorkflow)) {
        setSelectedWorkflow(config.defaultWorkflow);
      }
    } catch (error) {
      console.error('加载ComfyUI工作流出错:', error);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  // 打开工作流选择模态框
  const openWorkflowModal = (image: ImageFile) => {
    if (!hasComfyUIConfig) {
      alert('请先配置ComfyUI服务');
      return;
    }
    
    setCurrentEditingImage(image);
    loadWorkflows();
    setShowWorkflowModal(true);
  };

  // 关闭工作流选择模态框
  const closeWorkflowModal = () => {
    setShowWorkflowModal(false);
    setCurrentEditingImage(null);
  };

  // 在组件挂载时设置消息处理器
  useEffect(() => {
    // 监听ComfyUI的状态更新
    comfyUIMessageService.on('status', (data) => {
      console.log('ComfyUI状态更新:', data);
      // 这里可以更新UI显示处理状态
    });

    // 监听ComfyUI的错误
    comfyUIMessageService.on('error', (data) => {
      console.error('ComfyUI错误:', data);
      alert(`ComfyUI处理出错: ${data.message}`);
    });

    // 组件卸载时清理
    return () => {
      comfyUIMessageService.off('status');
      comfyUIMessageService.off('error');
    };
  }, []);

  // 修改handleEditWithComfyUI函数
  const handleEditWithComfyUI = async () => {
    if (!currentEditingImage || !hasComfyUIConfig) return;
    
    setIsProcessingComfyUI(true);
    closeWorkflowModal();
    
    try {
      const config = comfyuiService.getConfig();
      let comfyUIUrl = config.serverUrl;
      
      // 如果选择了工作流，添加到URL
      if (selectedWorkflow) {
        comfyUIUrl += `/?workflow=${encodeURIComponent(selectedWorkflow)}`;
      }
      
      // 使用消息服务打开ComfyUI窗口
      const comfyUIWindow = comfyUIMessageService.openComfyUIWindow(comfyUIUrl);
      
      // 等待窗口加载完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 发送图片数据到ComfyUI
      comfyUIMessageService.sendMessage({
        type: 'image',
        data: {
          url: currentEditingImage.preview,
          name: currentEditingImage.file.displayName || currentEditingImage.file.name
        }
      });
      
      // 如果选择了工作流，发送工作流数据
      if (selectedWorkflow) {
        const selectedWorkflowObj = availableWorkflows.find(w => w.id === selectedWorkflow);
        if (selectedWorkflowObj?.fileContent) {
          comfyUIMessageService.sendMessage({
            type: 'workflow',
            data: JSON.parse(selectedWorkflowObj.fileContent)
          });
        }
      }
      
      // alert('图片和工作流已发送到ComfyUI，请在新窗口中查看');
    } catch (error: any) {
      console.error('编辑图片出错:', error);
      alert(`编辑图片出错: ${error.message || '未知错误'}`);
    } finally {
      setIsProcessingComfyUI(false);
      setCurrentEditingImage(null);
    }
  };

  // 上传一组图片
  const handleUploadGroup = async (groupKey: string, groupImages: ImageFile[]) => {
    if (!hasConfig) {
      alert('请先配置上传服务');
      return;
    }
    
    if (isUploading) {
      return;
    }
    
    setIsUploading(true);
    setUploadResults(prev => ({ ...prev, [groupKey]: { status: 'uploading' } }));
    
    try {
      const results = await uploadService.uploadBatch(groupImages);
      
      // 检查结果
      const allSucceeded = results.every(result => result.success);
      const successCount = results.filter(result => result.success).length;
      
      setUploadResults(prev => ({
        ...prev,
        [groupKey]: {
          status: allSucceeded ? 'success' : 'partial',
          results,
          message: allSucceeded
            ? '全部上传成功'
            : `成功上传${successCount}/${results.length}张图片`
        }
      }));
      
      // 3秒后自动清除状态
      setTimeout(() => {
        setUploadResults(prev => {
          const newResults = { ...prev };
          delete newResults[groupKey];
          return newResults;
        });
      }, 3000);
      
    } catch (error: any) {
      console.error('上传图片组时出错:', error);
      
      setUploadResults(prev => ({
        ...prev,
        [groupKey]: {
          status: 'error',
          message: error.message || '上传失败'
        }
      }));
      
      // 3秒后自动清除错误状态
      setTimeout(() => {
        setUploadResults(prev => {
          const newResults = { ...prev };
          delete newResults[groupKey];
          return newResults;
        });
      }, 3000);
      
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <main>
        {/* 添加配置页面链接 */}
        <div className="header-actions">
          <Link href="/config" className="config-link">
            <span className="icon">⚙️</span> 图片上传配置
          </Link>
          <Link href="/config/comfyui" className="config-link">
            <span className="icon">🎨</span> ComfyUI配置
          </Link>
        </div>
        
        {/* <h1>图片快速排序</h1> */}
        
        {/* 固定在顶部的前缀输入区域 */}
        {selectedCount > 0 && (
          <div className="floating-prefix-form">
            <input 
              type="text" 
              placeholder="输入前缀..." 
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="prefix-input"
            />
            <button 
              onClick={applyPrefix}
              disabled={selectedCount === 0 || !prefix.trim()}
              className="apply-button"
            >
              应用前缀
            </button>
          </div>
        )}
        
        {/* 取消注释此段代码，恢复dropzone-info提示 */}
        {images.length === 0 && (
          <div className="dropzone-info">
            将图片拖放到页面任意位置，或双击页面任意位置选择图片
          </div>
        )}
        
        {/* 隐藏的图片上传组件，但通过ref暴露方法给整个页面 */}
        <div style={{ display: 'none' }}>
          <ImageDropzone 
            onImagesDrop={handleImagesDrop} 
            ref={imageDropzoneRef}
          />
        </div>
        
        {images.length > 0 ? (
          <>
            <SortableImageGrid 
              ref={gridRef}
              images={images} 
              setImages={handleImageOrderChange} 
              onSelectedChange={handleSelectedImagesChange}
              onImageError={handleImageError}
            />
            
            {/* 选中图片预览区 */}
            {selectedCount > 0 && (
              <div className="selected-images-preview">
                <div className="selected-images-header">
                  <h3>已选择 {selectedCount} 张图片</h3>
                </div>
                <div className="selected-images-container">
                  {images
                    .filter(img => selectedImagesRef.current.includes(img.id))
                    .map((image, idx) => {
                      const sortedIndex = selectedImagesRef.current.indexOf(image.id);
                      return (
                        <div key={image.id} className="selected-thumbnail">
                          <div className="selection-number">{sortedIndex + 1}</div>
                          <img 
                            src={image.preview} 
                            alt={`选中图片 ${idx + 1}`} 
                            onError={handleImageError}
                          />
                          <div className="selected-filename">{image.file.displayName || image.file.name}</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
            
            {/* 工作流选择模态框 */}
            {showWorkflowModal && (
              <div className="workflow-modal">
                <div className="workflow-modal-content">
                  <div className="workflow-modal-header">
                    <h3>选择ComfyUI工作流</h3>
                    <button className="close-modal-btn" onClick={closeWorkflowModal}>×</button>
                  </div>
                  
                  {isLoadingWorkflows ? (
                    <p className="loading-text">正在加载工作流列表...</p>
                  ) : (
                    availableWorkflows.length > 0 ? (
                      <div className="workflow-select">
                        <select
                          value={selectedWorkflow}
                          onChange={(e) => setSelectedWorkflow(e.target.value)}
                        >
                          <option value="">-- 使用默认工作流 --</option>
                          {availableWorkflows.map(workflow => (
                            <option key={workflow.id} value={workflow.id}>
                              {workflow.name} ({new Date(workflow.timestamp * 1000).toLocaleString()})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="no-workflows">未找到可用的工作流，请先在ComfyUI中创建工作流</p>
                    )
                  )}
                  
                  <div className="workflow-modal-footer">
                    <button onClick={closeWorkflowModal} className="cancel-btn">取消</button>
                    <button 
                      onClick={handleEditWithComfyUI} 
                      className="proceed-btn"
                      disabled={isLoadingWorkflows}
                    >
                      前往编辑
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 重命名后的图片展示区 */}
            {renamedImages.length > 0 && (
              <div className="renamed-images-section">
                <h3>已重命名的图片</h3>
                
                {/* 按组显示重命名的图片 */}
                {Array.from(
                  renamedImages.reduce((groups, img) => {
                    const key = `${(img as any).prefix}-${(img as any).applyTime}`;
                    if (!groups.has(key)) {
                      groups.set(key, {
                        prefix: (img as any).prefix,
                        time: (img as any).applyTime,
                        images: []
                      });
                    }
                    // 添加非空检查
                    const group = groups.get(key);
                    if (group) {
                      group.images.push(img);
                    }
                    return groups;
                  }, new Map<string, {prefix: string, time: string, images: ImageFile[]}>())
                ).map(([groupKey, group]: [string, {prefix: string, time: string, images: ImageFile[]}]) => (
                  <div key={groupKey} className="renamed-group">
                    <div className="renamed-group-header">
                      <div>
                        <span className="renamed-group-prefix">{group.prefix}</span>
                        <span className="renamed-group-time">({group.time})</span>
                      </div>
                      
                      <div className="group-actions">
                        <button 
                          className="group-download-btn"
                          onClick={() => downloadGroupImages(group.images)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? '下载中...' : '下载此组'}
                        </button>
                        
                        <button 
                          className="upload-group-btn"
                          onClick={() => handleUploadGroup(groupKey, group.images)}
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
                            onError={handleImageError}
                          />
                          <div className="renamed-filename">{image.file.displayName || image.file.name}</div>
                          
                          {/* 添加ComfyUI编辑按钮 */}
                          <button 
                            className="edit-comfyui-btn"
                            onClick={() => openWorkflowModal(image)}
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
                
                <div className="renamed-actions">
                  <button 
                    onClick={downloadRenamedImages}
                    disabled={isDownloading}
                  >
                    {isDownloading ? '下载中...' : '下载所有重命名图片'}
                  </button>
                  
                  <button onClick={clearRenamedImages}>
                    清空重命名图片
                  </button>
                </div>
              </div>
            )}
            
            <div className="actions">
              <button onClick={clearImages}>
                清空所有图片
              </button>
              <button onClick={deleteSelected}>
                删除选中图片
              </button>
              <button onClick={downloadOrder}>
                下载排序结果
              </button>
              {selectedCount > 0 && (
                <button 
                  onClick={downloadSelectedImages}
                  disabled={selectedImagesRef.current.length === 0 || isDownloading}
                >
                  {isDownloading ? '下载中...' : `下载选中图片 (${selectedImagesRef.current.length})`}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="empty-message">
            {/* <p>请拖拽或选择图片以开始排序</p> */}
          </div>
        )}
      </main>
    </DndProvider>
  );
}