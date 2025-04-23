'use client';

import { useRef } from 'react';
import useImageUpload from '@/hooks/useImageUpload';
import { UploadCloud, Copy, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface SimpleUploaderProps {
  onSuccess?: (url: string) => void;
  path?: string;
}

export default function SimpleUploader({ onSuccess, path }: SimpleUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, uploadActions] = useImageUpload();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadActions.upload(e.target.files[0], { path });
      if (url && onSuccess) {
        onSuccess(url);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // 构建完整URL
  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (typeof window === 'undefined') return url;
    return `${window.location.origin}${url}`;
  };

  return (
    <div className="w-full">
      <div
        onClick={triggerFileInput}
        className={`
          border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center
          text-center cursor-pointer transition-colors
          ${uploadState.isUploading 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {uploadState.isUploading ? (
          <div className="flex flex-col items-center py-4">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-gray-600">上传中... {uploadState.progress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <UploadCloud className="w-8 h-8 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-600">点击上传图片</p>
          </div>
        )}
      </div>

      {uploadState.error && (
        <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{uploadState.error}</span>
        </div>
      )}

      {uploadState.result && uploadState.result.success && (
        <div className="mt-3 border rounded-lg overflow-hidden">
          <div className="flex items-center border-b p-2 bg-gray-50 justify-between">
            <h4 className="text-sm font-medium">上传成功</h4>
            <button
              onClick={() => uploadActions.reset()}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              重新上传
            </button>
          </div>
          
          <div className="p-3">
            <div className="flex items-center mb-3">
              <input 
                type="text"
                readOnly
                value={uploadState.result?.url ? getFullUrl(uploadState.result.url) : ''}
                className="flex-1 py-1 px-2 text-sm border rounded bg-gray-50"
              />
              <button
                onClick={() => uploadState.result?.url && copyToClipboard(getFullUrl(uploadState.result.url))}
                className="ml-2 p-1 text-gray-600 hover:text-blue-600"
                title="复制链接"
              >
                {copySuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded overflow-hidden">
              {uploadState.result.url && (
                <img 
                  src={uploadState.result.url} 
                  alt="已上传图片"
                  className="object-contain w-full h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 