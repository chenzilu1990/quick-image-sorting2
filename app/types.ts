import type { NextPage } from 'next';

export interface ComfyUIConfig {
  serverUrl: string;
  defaultWorkflow: string;
  authorizedDirectoryName?: string;  // 已授权的目录名
}

export interface ImageFile {
  id: string;
  preview: string;
  file: {
    name: string;
    displayName?: string;
    size: number;
    type: string;
  };
  group?: string;
}

export interface Workflow {
  id: string;
  name: string;
  timestamp: number;
  filePath: string;
  fileContent: string;
} 