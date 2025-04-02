import type { NextPage } from 'next';

export interface ComfyUIConfig {
  serverUrl: string;
  defaultWorkflow: string;
  authorizedDirectoryName?: string;  // 已授权的目录名
}

// 自定义File类型
export interface CustomFile extends File {
  displayName?: string;
  objectUrl?: string; // 添加图片的base64数据
}

// 简化的文件类型，避免使用完整的File对象
export interface SimpleFile {
  name: string;
  displayName?: string;
  size: number;
  type: string;
  objectUrl?: string;
}

export interface ImageFile {
  id: string;
  preview: string;
  file: SimpleFile | CustomFile;
  displayName?: string;
  isSelected?: boolean;
  group?: string;
  originalName?: string;
  isRenamed?: boolean;
  originalImageId?: string;
  prefix?: string;
  applyTime?: string;
}

export interface Workflow {
  id: string;
  name: string;
  timestamp: number;
  filePath?: string;
  fileContent?: string;
} 