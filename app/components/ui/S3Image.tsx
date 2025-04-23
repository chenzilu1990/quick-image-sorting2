'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { createCorsProofImageUrl } from '@/utils/s3-helper';

interface S3ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * S3Image 组件
 * 专门设计用于处理S3图片的CORS问题，自动使用代理URL
 */
const S3Image: React.FC<S3ImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc,
  priority = false,
  sizes,
  onLoad,
  onError
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => createCorsProofImageUrl(src));
  const [error, setError] = useState<boolean>(false);

  // 处理图片加载错误
  const handleError = () => {
    // 如果提供了回退图片且当前不是回退图片，则使用回退图片
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      console.warn(`图片加载失败，使用回退图片: ${src}`);
      setImgSrc(fallbackSrc);
    } else {
      // 标记为错误状态
      setError(true);
      console.error(`图片加载失败: ${src}`);
    }
    
    // 触发外部错误回调
    if (onError) onError();
  };

  // 处理图片加载成功
  const handleLoad = () => {
    if (onLoad) onLoad();
  };

  // 如果发生错误且没有回退图片，则显示占位符
  if (error && !fallbackSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width || 100, height: height || 100 }}
      >
        <span className="text-gray-400 text-xs text-center px-2">图片加载失败</span>
      </div>
    );
  }

  // 渲染图片
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      priority={priority}
      sizes={sizes}
    />
  );
};

export default S3Image; 