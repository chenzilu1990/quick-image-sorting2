'use client';

import { useState, useEffect, useCallback, useRef, ChangeEvent, KeyboardEvent, DragEvent, MouseEvent } from 'react';
import Link from 'next/link';
import './globals.css';
import comfyuiService from './services/comfyuiService';
import type { ImageFile, RenameConfig } from '@/types';

export default function Home() {
  // 状态管理
  const [uploadedFiles, setUploadedFiles] = useState<ImageFile[]>([]);
  const [renamePrefix, setRenamePrefix] = useState<string>('');
  const [useMain, setUseMain] = useState<boolean>(false);
  const [usePT, setUsePT] = useState<boolean>(false);
  const [useSwitch, setUseSwitch] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasComfyUIConfig, setHasComfyUIConfig] = useState<boolean>(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState<boolean>(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState<boolean>(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [currentEditingImage, setCurrentEditingImage] = useState<ImageFile | null>(null);
  const [isProcessingComfyUI, setIsProcessingComfyUI] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);
  
  // 页面加载时检查配置
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const config = comfyuiService.getConfig();
        setHasComfyUIConfig(!!config.serverUrl);
      } catch (error) {
        console.error('检查ComfyUI配置出错:', error);
        setHasComfyUIConfig(false);
      }
    };
    
    checkConfig();
  }, []);
  
  // 更多代码将在TypeScript重构过程中逐步添加
  
  return (
    <main>
      <h1>正在进行TypeScript转换...</h1>
      <p>该页面正在重构为TypeScript版本</p>
      <Link href="/config/comfyui">配置ComfyUI</Link>
    </main>
  );
} 