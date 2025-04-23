'use client';

import { useState, useCallback } from 'react';
import { uploadImage, uploadBase64Image, uploadImageFromUrl } from '../utils/uploadHelper';

interface UploadOptions {
  path?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  result: {
    success: boolean;
    url: string;
    filename?: string;
    originalName?: string;
    size?: number;
    type?: string;
    path?: string;
  } | null;
  error: string | null;
}

interface UploadActions {
  upload: (file: File, options?: UploadOptions) => Promise<string>;
  uploadBase64: (base64Data: string, filename?: string, options?: UploadOptions) => Promise<string>;
  uploadFromUrl: (imageUrl: string, filename?: string, options?: UploadOptions) => Promise<string>;
  reset: () => void;
}

/**
 * 图片上传自定义钩子
 * 
 * 提供React组件中方便使用的图片上传功能
 * @returns 上传状态和操作方法
 */
export default function useImageUpload(): [UploadState, UploadActions] {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    result: null,
    error: null,
  });

  // 上传文件
  const upload = useCallback(async (file: File, options: UploadOptions = {}): Promise<string> => {
    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      const result = await uploadImage(file, {
        ...options,
        onProgress: (progress) => {
          setState(prev => ({ ...prev, progress }));
        },
      });

      if (!result.success) {
        setState(prev => ({
          ...prev,
          isUploading: false,
          error: result.error || '上传失败',
          result: null,
        }));
        return '';
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        result,
        error: null,
      }));

      return result.url;
    } catch (error) {
      const errorMessage = (error as Error).message || '上传过程中发生错误';
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        result: null,
      }));
      return '';
    }
  }, []);

  // 上传Base64图片
  const uploadBase64 = useCallback(async (
    base64Data: string,
    filename: string = 'image.png',
    options: UploadOptions = {}
  ): Promise<string> => {
    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      const result = await uploadBase64Image(base64Data, filename, {
        ...options,
        onProgress: (progress) => {
          setState(prev => ({ ...prev, progress }));
        },
      });

      if (!result.success) {
        setState(prev => ({
          ...prev,
          isUploading: false,
          error: result.error || '上传失败',
          result: null,
        }));
        return '';
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        result,
        error: null,
      }));

      return result.url;
    } catch (error) {
      const errorMessage = (error as Error).message || '上传过程中发生错误';
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        result: null,
      }));
      return '';
    }
  }, []);

  // 从URL上传图片
  const uploadFromUrl = useCallback(async (
    imageUrl: string,
    filename: string = 'image.png',
    options: UploadOptions = {}
  ): Promise<string> => {
    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      const result = await uploadImageFromUrl(imageUrl, filename, {
        ...options,
        onProgress: (progress) => {
          setState(prev => ({ ...prev, progress }));
        },
      });

      if (!result.success) {
        setState(prev => ({
          ...prev,
          isUploading: false,
          error: result.error || '上传失败',
          result: null,
        }));
        return '';
      }

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        result,
        error: null,
      }));

      return result.url;
    } catch (error) {
      const errorMessage = (error as Error).message || '上传过程中发生错误';
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        result: null,
      }));
      return '';
    }
  }, []);

  // 重置状态
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      result: null,
      error: null,
    });
  }, []);

  return [
    state,
    { upload, uploadBase64, uploadFromUrl, reset }
  ];
} 