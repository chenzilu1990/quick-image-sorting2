'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Copy, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  path: string;
  error?: string;
}

export default function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '上传失败');
      }

      setUploadResult(result);
    } catch (err) {
      setError((err as Error).message || '上传过程中发生错误');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      setError('复制失败: ' + err.message);
    });
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">图片上传</h2>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader className="h-10 w-10 text-blue-500 animate-spin mb-2" />
            <p className="text-gray-600">正在上传...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
            <p className="font-medium text-gray-600">
              将图片拖放到这里，或 <span className="text-blue-600">点击上传</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">支持 PNG, JPG, GIF 等图片格式</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {uploadResult && uploadResult.success && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-medium">上传成功</h3>
          </div>
          
          <div className="p-4">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded mb-4">
              <img 
                src={uploadResult.url} 
                alt={uploadResult.originalName}
                className="object-contain h-full w-full rounded"
              />
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">图片链接:</p>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={window.location.origin + uploadResult.url}
                    readOnly
                    className="flex-1 border rounded-lg px-3 py-2 text-sm bg-gray-50"
                  />
                  <button 
                    onClick={() => copyToClipboard(window.location.origin + uploadResult.url)}
                    className="ml-2 p-2 text-gray-600 hover:text-blue-600"
                    title="复制链接"
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">文件名</p>
                  <p className="font-medium truncate">{uploadResult.filename}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">大小</p>
                  <p className="font-medium">{(uploadResult.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 