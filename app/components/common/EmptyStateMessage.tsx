'use client';

import React from 'react';
import { useDictionary } from '@/components/hooks/client-dictionary';
import { ImageOff } from 'lucide-react';

interface EmptyStateMessageProps {
  message?: string;
}

/**
 * 空状态消息组件
 * 
 * 当没有图片时显示的提示信息
 */
const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ message }) => {
  const dict = useDictionary();
  const defaultMessage = dict.home.emptyState || '请拖拽或选择图片以开始排序';
  
  return (
    <div className="flex flex-col items-center justify-center h-72 my-12 text-center text-gray-500">
      <div className="my-5 opacity-70">
        <ImageOff size={80} strokeWidth={1} className="text-gray-400" />
      </div>
      <p className="text-lg">{message || defaultMessage}</p>
      <p className="text-sm text-gray-400 mt-2">{dict.home.dropzone}</p>
    </div>
  );
};

export default EmptyStateMessage; 