'use client';

import React, { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDropzone, DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';
import type { ImageFile, SimpleFile } from '@/types';
import clsx from 'clsx'; // Import clsx
import { UploadCloud, Loader2 } from 'lucide-react'; // Import icons

// 组件引用类型
export interface ImageDropzoneRef {
  openFileDialog: () => void;
}

// 组件属性类型
interface ImageDropzoneProps {
  onImagesDrop: (images: ImageFile[]) => void;
}

const ImageDropzone = forwardRef<ImageDropzoneRef, ImageDropzoneProps>(({ onImagesDrop }, ref) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => { // Made async for potential future use
    if (!acceptedFiles || !Array.isArray(acceptedFiles) || acceptedFiles.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const imageFiles = acceptedFiles.filter(file => file?.type?.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        setIsProcessing(false);
        return;
      }
      
      const imagesWithPreview = imageFiles.map(file => {
        const simpleFile: SimpleFile = { name: file.name, size: file.size, type: file.type };
        const imageFile: ImageFile = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          preview: URL.createObjectURL(file),
          file: simpleFile
        };
        return imageFile;
      });
      
      // Simulate processing time if needed for UX
      // await new Promise(resolve => setTimeout(resolve, 500)); 

      onImagesDrop(imagesWithPreview);
    } catch (error) {
      console.error('Error processing dropped images:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onImagesDrop]);

  const {
    getRootProps, 
    getInputProps, 
    isDragActive, 
    isDragAccept, 
    isDragReject,
    open 
  } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: isProcessing,
    noClick: false, // Allow click to open dialog
    noKeyboard: true 
  });

  // Expose openFileDialog method
  useImperativeHandle(ref, () => ({ openFileDialog: open }));

  // Remove the global useEffect listeners

  const baseClasses =
    'flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out mb-8';
  
  const dropzoneClasses = clsx(
    baseClasses,
    {
      'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50': !isDragActive && !isProcessing,
      'border-blue-500 bg-blue-100 ring-2 ring-blue-300': isDragAccept,
      'border-red-500 bg-red-100': isDragReject,
      'border-gray-400 bg-gray-100 cursor-wait opacity-80': isProcessing,
    }
  );

  return (
    // Render the visual dropzone area
    <div {...getRootProps({ className: dropzoneClasses })}>
      <input {...getInputProps()} />
      {
        isProcessing ? (
          <>
            <Loader2 className="h-10 w-10 text-gray-500 animate-spin mb-3" />
            <p className="text-gray-600">处理图片中...</p>
          </>
        ) : isDragAccept ? (
          <>
            <UploadCloud className="h-10 w-10 text-blue-500 mb-3" />
            <p className="font-medium text-blue-600">松开即可上传!</p>
          </>
        ) : isDragReject ? (
          <>
             <UploadCloud className="h-10 w-10 text-red-500 mb-3" />
            <p className="font-medium text-red-600">文件类型不支持</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-gray-400 group-hover:text-blue-500 mb-3" />
            <p className="font-medium text-gray-600">
              将图片拖放到这里, 或 <span className="text-blue-600 font-semibold">点击上传</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">支持 PNG, JPG, GIF 等图片格式</p>
          </>
        )
      }
    </div>
  );
});

ImageDropzone.displayName = 'ImageDropzone';

export default ImageDropzone; 