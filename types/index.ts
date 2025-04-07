// 图片文件类型
export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  group?: string;
}

// 上传结果类型
export interface UploadResult {
  status: 'uploading' | 'success' | 'error' | 'partial';
  message?: string;
  results?: Array<{success: boolean}>;
}

// ComfyUI配置类型
export interface ComfyUIConfig {
  serverUrl: string;
  defaultWorkflow: string;
  authorizedDirectoryName?: string;  // 已授权的目录名
}

// 工作流类型
export interface Workflow {
  id: string;
  name: string;
  fileContent: string;
  path: string;
}

// 重命名模式枚举
export enum RenameMode {
  AMAZON = 'amazon',
  PREFIX_INDEX = 'prefix_index',
  CUSTOM_SEQUENCE = 'custom_sequence',
  AI_GENERATED = 'ai_generated'
}

// 重命名组类型
export interface RenamedGroup {
  prefix: string;
  images: ImageFile[];
}

// 上传配置类型
export interface UploadConfig {
  selectedService: 'github' | 'custom';
  github?: {
    token: string;
    owner: string;
    repo: string;
  };
  customServer?: {
    apiUrl: string;
  };
} 