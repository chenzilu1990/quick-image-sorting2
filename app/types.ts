import type { NextPage } from 'next';

export interface ComfyUIConfig {
  serverUrl: string;
  defaultWorkflow: string;
  authorizedDirectoryName?: string;  // 已授权的目录名
}

// 简化的文件类型，避免使用完整的File对象
export interface SimpleFile {
  name: string;
  displayName?: string;
  size: number;
  type: string;
}

export interface ImageFile {
  id: string;
  preview: string;
  file: SimpleFile;
  group?: string;
}

export interface Workflow {
  id: string;
  name: string;
  timestamp: number;
  filePath: string;
  fileContent: string;
} 