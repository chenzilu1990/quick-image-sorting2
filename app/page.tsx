'use client';

import { useState, useCallback, useRef, useEffect, MouseEvent, RefObject } from 'react';
import ImageDropzone, { ImageDropzoneRef } from './components/ImageDropzone';
import SortableImageGrid, { SortableImageGridRef } from './components/SortableImageGrid';
import WorkflowModal from './components/WorkflowModal';
import ImageGroupViewer from './components/ImageGroupViewer';
import SelectedImagesScroller from './components/SelectedImagesScroller';
import ActionButtons from './components/ActionButtons';
import RenamedImageActions from './components/RenamedImageActions';
import PrefixInputForm from './components/PrefixInputForm';
import HeaderActions from './components/HeaderActions';
import EmptyStateMessage from './components/EmptyStateMessage';
import JSZip from 'jszip';
import './globals.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Link from 'next/link';
import uploadService from './services/uploadService';
import comfyuiService from './services/comfyuiService';
import comfyUIMessageService from './services/comfyuiMessageService';
import { imageCacheService } from './services/imageCacheService';
import type { ImageFile, Workflow } from './types';
import { RenameMode } from '../types/index';

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
  const [suffix, setSuffix] = useState('');
  const [customSequence, setCustomSequence] = useState('');
  const [renameMode, setRenameMode] = useState<RenameMode>(RenameMode.AMAZON);
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

  // 保存图片数据到IndexedDB
  const saveImagesToStorage = useCallback(async (imgList: ImageFile[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      console.log(`保存${imgList.length}张图片到IndexedDB`);
      
      // 使用IndexedDB保存图片数据
      await imageCacheService.saveImages(imgList);
      
      console.log('成功保存图片数据到IndexedDB');
    } catch (error) {
      console.error('保存图片数据失败:', error);
      alert('保存图片数据失败，可能是因为图片过大或浏览器不支持IndexedDB。');
    }
  }, []);

  // 保存重命名图片数据到IndexedDB
  const saveRenamedImagesToStorage = useCallback(async (imgList: ImageFile[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      console.log(`保存${imgList.length}张重命名图片到IndexedDB`);
      
      // 使用IndexedDB保存重命名图片数据
      await imageCacheService.saveRenamedImages(imgList);
      
      console.log('成功保存重命名图片数据到IndexedDB');
    } catch (error) {
      console.error('保存重命名图片数据失败:', error);
      alert('保存重命名图片数据失败，可能是因为图片过大或浏览器不支持IndexedDB。');
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
  const loadImagesFromStorage = useCallback(async () => {
    if (typeof window === 'undefined' || imagesLoaded) return;
    
    try {
      console.log('尝试从IndexedDB加载图片数据...');
      
      // 从IndexedDB加载图片
      const restoredImages = await imageCacheService.loadImages();
      if (restoredImages && restoredImages.length > 0) {
        console.log(`成功从IndexedDB加载了${restoredImages.length}张图片`);
        
        // 为图片重新生成blob URL
        const processedImages = restoredImages.map(image => {
          // 如果有file属性且没有preview或preview已失效(以blob:开头)，则重新生成preview
          if (image.file && (!image.preview || image.preview.startsWith('blob:'))) {
            // 如果图片有原始数据，使用它创建新的blob
            if (image.file.objectUrl) {
              // 将base64转换回blob
              const base64 = image.file.objectUrl;
              const byteString = atob(base64.split(',')[1]);
              const mimeType = base64.split(',')[0].split(':')[1].split(';')[0];
              
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              
              const blob = new Blob([ab], { type: mimeType });
              image.preview = URL.createObjectURL(blob);
            }
          }
          return image;
        });
        
        setImages(processedImages);
      }
      
      // 从IndexedDB加载重命名的图片
      const restoredRenamedImages = await imageCacheService.loadRenamedImages();
      if (restoredRenamedImages && restoredRenamedImages.length > 0) {
        console.log(`成功从IndexedDB加载了${restoredRenamedImages.length}张重命名图片`);
        
        // 为重命名图片重新生成blob URL
        const processedRenamedImages = restoredRenamedImages.map(image => {
          // 如果有file属性且没有preview或preview已失效(以blob:开头)，则重新生成preview
          if (image.file && (!image.preview || image.preview.startsWith('blob:'))) {
            // 如果图片有原始数据，使用它创建新的blob
            if (image.file.objectUrl) {
              // 将base64转换回blob
              const base64 = image.file.objectUrl;
              const byteString = atob(base64.split(',')[1]);
              const mimeType = base64.split(',')[0].split(':')[1].split(';')[0];
              
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              
              const blob = new Blob([ab], { type: mimeType });
              image.preview = URL.createObjectURL(blob);
            }
          }
          return image;
        });
        
        setRenamedImages(processedRenamedImages);
      }
      
      setImagesLoaded(true); // 标记为已加载
    } catch (error) {
      console.error('加载保存的图片失败:', error);
      setImagesLoaded(true); // 即使出错也标记为已加载，避免无限循环
    }
  }, [imagesLoaded]);

  // 从localStorage加载图片数据的useEffect
  useEffect(() => {
    // 如果已经加载过图片，不再重复加载
    if (imagesLoaded) return;

    const loadData = async () => {
      await loadImagesFromStorage();
    };
    
    loadData();
  }, [loadImagesFromStorage, imagesLoaded]);

  // 修改handleImagesDrop函数，处理异步保存
  const handleImagesDrop = useCallback(async (newImages: ImageFile[]) => {
    if (!newImages || !Array.isArray(newImages) || newImages.length === 0) return;
    
    // 为每个图片保存原始数据作为objectUrl
    const imagesWithObjectUrl = await Promise.all(newImages.map(async (image) => {
      try {
        // 将图片URL转换为base64，用于持久存储
        const objectUrl = await imageToBase64(image.preview);
        
        return {
          ...image,
          file: {
            ...image.file,
            objectUrl // 存储base64数据
          }
        };
      } catch (error) {
        console.error('处理图片数据失败:', error);
        return image;
      }
    }));
    
    const updatedImages = [...images, ...imagesWithObjectUrl];
    setImages(updatedImages);
    saveImagesToStorage(updatedImages);
  }, [images, saveImagesToStorage, imageToBase64]);

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

  // 修改applyPrefix函数，支持多种重命名模式
  const applyPrefix = useCallback(() => {
    // 根据重命名模式检查必填输入
    if (selectedImagesRef.current.length === 0) return;
    
    // Amazon模式需要前缀
    if (renameMode === RenameMode.AMAZON && !prefix.trim()) return;
    
    // 自定义序列模式需要序列
    if (renameMode === RenameMode.CUSTOM_SEQUENCE && !customSequence.trim()) return;
    
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
    const newRenamedImages = selectedImagesToRename.map((image, index) => {
      const selectedIndex = image.selectionIndex;
      let typeName = '';
      
      // 根据不同的重命名模式生成不同的文件名
      switch (renameMode) {
        case RenameMode.AMAZON:
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
          break;
          
        case RenameMode.PREFIX_INDEX:
          // 前缀-index-后缀格式，其中前缀和后缀可选
          typeName = String(selectedIndex + 1).padStart(2, '0');
          break;
          
        case RenameMode.CUSTOM_SEQUENCE:
          // 自定义序列，如果序列长度不够则重复使用最后一个值
          const sequences = customSequence.split(',').map(s => s.trim()).filter(s => s !== '');
          if (sequences.length === 0) {
            typeName = String(selectedIndex + 1);
          } else if (selectedIndex < sequences.length) {
            typeName = sequences[selectedIndex];
          } else {
            typeName = sequences[sequences.length - 1] + (selectedIndex - sequences.length + 1);
          }
          break;
          
        case RenameMode.AI_GENERATED:
          // 暂时使用默认名称，后期可以接入AI API
          typeName = `AI-Generated-${String(selectedIndex + 1).padStart(2, '0')}`;
          break;
          
        default:
          typeName = String(selectedIndex + 1);
      }
      
      // 获取文件扩展名（优先使用已有的displayName，否则使用原始文件名）
      const sourceFileName = image.file.displayName || image.file.name;
      
      // 改进的扩展名提取方法
      let fileExt = '';
      const lastDotIndex = sourceFileName.lastIndexOf('.');
      if (lastDotIndex !== -1 && lastDotIndex > sourceFileName.lastIndexOf('/') && lastDotIndex > sourceFileName.lastIndexOf('\\')) {
        fileExt = sourceFileName.substring(lastDotIndex);
      }
      
      // 根据不同重命名模式创建新名称
      let newDisplayName = '';
      switch (renameMode) {
        case RenameMode.AMAZON:
          newDisplayName = `${prefix}.${typeName}${fileExt}`;
          break;
          
        case RenameMode.PREFIX_INDEX:
          // 处理前缀和后缀可以为空的情况
          if (prefix && suffix) {
            newDisplayName = `${prefix}${typeName}${suffix}${fileExt}`;
          } else if (prefix && !suffix) {
            newDisplayName = `${prefix}${typeName}${fileExt}`;
          } else if (!prefix && suffix) {
            newDisplayName = `${typeName}${suffix}${fileExt}`;
          } else {
            newDisplayName = `${typeName}${fileExt}`;
          }
          break;
          
        case RenameMode.CUSTOM_SEQUENCE:
          // 自定义序列直接使用用户输入，不需要前缀
          newDisplayName = `${typeName}${fileExt}`;
          break;
          
        case RenameMode.AI_GENERATED:
          // AI生成的名称，不需要前缀
          newDisplayName = `${typeName}${fileExt}`;
          break;
          
        default:
          newDisplayName = `${prefix || ''}-${typeName}${fileExt}`;
      }
      
      // 创建新的图片对象，保留原始图片的objectUrl
      return {
        ...image,
        id: `renamed-${image.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // 确保ID唯一
        file: {
          ...image.file,
          displayName: newDisplayName
          // objectUrl会自动继承自原始image.file
        },
        isRenamed: true,
        originalImageId: image.id,
        prefix: prefix, // 保存使用的前缀
        renameMode: renameMode, // 保存使用的重命名模式
        applyTime: new Date().toLocaleString() // 保存应用时间，便于识别
      } as ImageFile;
    });
    
    // 更新重命名图片
    const updatedRenamedImages = [...renamedImages, ...newRenamedImages];
    setRenamedImages(updatedRenamedImages);
    saveRenamedImagesToStorage(updatedRenamedImages);
    
    // 状态更新后立即重置选择
    gridRef.current?.resetSelection();
    
  }, [prefix, suffix, customSequence, renameMode, images, renamedImages, saveRenamedImagesToStorage]);

  // 修改clearImages函数，清理base64图片
  const clearImages = useCallback(() => {
    if (images.length === 0) return;
    
    // 释放预览URL (仅blob URL)
    images.forEach(image => {
      if (image && image.preview && image.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    });
    setImages([]);
    
    // 清理IndexedDB缓存
    imageCacheService.clearImages();
  }, [images]);

  // 修改clearRenamedImages函数，清理base64图片
  const clearRenamedImages = useCallback(() => {
    if (renamedImages.length === 0) return;
    
    // 释放预览URL (仅blob URL)
    renamedImages.forEach(image => {
      if (image && image.preview && image.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    });
    
    setRenamedImages([]);
    
    // 清理IndexedDB缓存
    imageCacheService.clearRenamedImages();
  }, [renamedImages]);

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
        {/* 头部配置链接 */}
        <HeaderActions />
        
        {/* 前缀输入区域 */}
        <PrefixInputForm 
          prefix={prefix}
          selectedCount={selectedCount}
          onPrefixChange={setPrefix}
          onApplyPrefix={applyPrefix}
          renameMode={renameMode}
          onRenameModeChange={setRenameMode}
          suffix={suffix}
          onSuffixChange={setSuffix}
          customSequence={customSequence}
          onCustomSequenceChange={setCustomSequence}
        />
        
        {/* 提示信息 */}
        {images.length === 0 && (
          <div className="dropzone-info">
            将图片拖放到页面任意位置，或双击页面任意位置选择图片
          </div>
        )}
        
        {/* 隐藏的图片上传组件 */}
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
            <SelectedImagesScroller 
              selectedCount={selectedCount}
              selectedImagesIds={selectedImagesRef.current}
              images={images}
              onImageError={handleImageError}
              onClearSelection={() => gridRef.current?.resetSelection()}
            />
            
            {/* 工作流选择模态框 */}
            {showWorkflowModal && (
              <WorkflowModal
                isLoading={isLoadingWorkflows}
                availableWorkflows={availableWorkflows}
                selectedWorkflow={selectedWorkflow}
                onWorkflowSelect={(workflowId) => setSelectedWorkflow(workflowId)}
                onClose={closeWorkflowModal}
                onEditWithComfyUI={handleEditWithComfyUI}
              />
            )}
            
            {/* 重命名后的图片展示区 */}
            {renamedImages.length > 0 && (
              <>
                <ImageGroupViewer
                  groups={Array.from(
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
                  )}
                  uploadResults={uploadResults}
                  isDownloading={isDownloading}
                  isUploading={isUploading}
                  isProcessingComfyUI={isProcessingComfyUI}
                  currentEditingImage={currentEditingImage}
                  hasConfig={hasConfig}
                  hasComfyUIConfig={hasComfyUIConfig}
                  onDownloadGroup={downloadGroupImages}
                  onUploadGroup={handleUploadGroup}
                  onOpenWorkflowModal={openWorkflowModal}
                  onImageError={handleImageError}
                />
                
                <RenamedImageActions 
                  isDownloading={isDownloading}
                  onDownloadRenamedImages={downloadRenamedImages}
                  onClearRenamedImages={clearRenamedImages}
                />
              </>
            )}
            
            <ActionButtons
              selectedCount={selectedCount}
              isDownloading={isDownloading}
              onClearImages={clearImages}
              onDeleteSelected={deleteSelected}
              onDownloadOrder={downloadOrder}
              onDownloadSelected={downloadSelectedImages}
            />
          </>
        ) : (
          <EmptyStateMessage />
        )}
      </main>
    </DndProvider>
  );
}