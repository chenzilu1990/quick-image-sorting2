// 扩展原生File类型
interface CustomFile extends File {
  displayName?: string;
}

// 图片文件类型定义
export interface ImageFile {
  id: string;
  file: CustomFile;
  preview: string;
  displayName?: string;
  isSelected?: boolean;
  group?: string;
  originalName?: string;
  isRenamed?: boolean;
  originalImageId?: string;
  prefix?: string;
  applyTime?: string;
}

// 重命名配置类型定义
export interface RenameConfig {
  prefix: string;
  useMain: boolean;
  usePT: boolean;
  useSwitch: boolean;
}

// GitHub配置类型定义
export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  path: string;
}

// 自定义服务器配置类型定义
export interface ServerConfig {
  url: string;
  username: string;
  password: string;
  token: string;
}

// ComfyUI配置类型定义
export interface ComfyUIConfig {
  serverUrl: string;
  defaultWorkflow: string;
  authorizedDirectoryName?: string;  // 已授权的目录名
}

// 工作流类型定义
export interface Workflow {
  id: string;
  name: string;
  timestamp: number;
  filePath?: string;
  fileContent?: string;
} 