import { ComfyUIConfig, Workflow } from '@/types';

/**
 * ComfyUI服务 - 直接API通信版
 * 使用ComfyUI的API进行通信，需要在ComfyUI启动时添加--enable-cors-header参数
 */

// 从localStorage获取ComfyUI配置
const getConfig = (): ComfyUIConfig => {
  try {
    if (typeof window === 'undefined') {
      return {
        serverUrl: 'http://localhost:8088',
        defaultWorkflow: '',
        workflowsPath: ''
      };
    }
    
    const savedConfig = localStorage.getItem('comfyUIConfig');
    if (!savedConfig) {
      return {
        serverUrl: 'http://localhost:8088',
        defaultWorkflow: '',
        workflowsPath: ''
      };
    }
    return JSON.parse(savedConfig) as ComfyUIConfig;
  } catch (error) {
    console.error('获取ComfyUI配置出错:', error);
    return {
      serverUrl: 'http://localhost:8088',
      defaultWorkflow: '',
      workflowsPath: ''
    };
  }
};

// 检查文件系统API是否可用
const isFileSystemAPIAvailable = (): boolean => {
  return 'showDirectoryPicker' in window;
};

// 请求目录访问权限
const requestDirectoryAccess = async (path: string): Promise<boolean> => {
  try {
    if (!path || path.trim() === '') {
      return false;
    }
    
    console.log('请求文件系统访问权限...');
    
    // 检查API是否可用
    if (!isFileSystemAPIAvailable()) {
      console.warn('File System Access API不可用，使用备用方法');
      alert('您的浏览器不支持直接访问文件系统，请使用Chrome/Edge等现代浏览器。');
      return false;
    }
    
    try {
      // 请求文件系统访问权限
      directoryHandle = await (window as unknown as WindowWithFileSystem).showDirectoryPicker({
        id: 'comfyui-workflows-' + Date.now(), // 添加时间戳确保每次请求都是唯一的
        mode: 'read'
        // 移除startIn参数，允许用户从任何位置开始选择
      });
      
      console.log('文件选择器已显示');
      return !!directoryHandle;
    } catch (pickerError) {
      console.error('文件选择器错误:', pickerError);
      // 尝试替代方案
      alert('请选择工作流文件夹');
      return false;
    }
  } catch (error) {
    console.error('请求目录访问权限失败:', error);
    return false;
  }
};

// 保存ComfyUI配置
const saveConfig = async (config: ComfyUIConfig): Promise<boolean> => {
  try {
    // 获取旧配置
    const oldConfig = getConfig();
    
    // 只有在工作流路径发生变化或首次设置时，才请求目录访问权限
    if (config.workflowsPath && 
        config.workflowsPath.trim() !== '' && 
        config.workflowsPath !== oldConfig.workflowsPath) {
      console.log('工作流路径已更改，正在请求目录访问权限:', config.workflowsPath);
      // 请求目录访问权限
      const accessGranted = await requestDirectoryAccess(config.workflowsPath);
      if (!accessGranted) {
        console.warn('未获得目录访问权限，但仍会保存配置');
      } else {
        console.log('成功获取目录访问权限');
      }
    } else {
      console.log('仅更新服务器URL或其他设置，无需重新请求目录权限');
    }
    
    localStorage.setItem('comfyUIConfig', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('保存ComfyUI配置出错:', error);
    return false;
  }
};

interface ConnectionResult {
  status: boolean;
  message: string;
  data?: any;
}

// 检查ComfyUI配置有效性和连接状态
const checkConnection = async (): Promise<ConnectionResult> => {
  try {
    const config = getConfig();
    
    // 测试连接
    const response = await fetch(`${config.serverUrl}/system_stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`连接失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      status: true,
      message: '连接成功',
      data
    };
  } catch (error: any) {
    console.error('连接ComfyUI出错:', error);
    return {
      status: false,
      message: error.message || '连接ComfyUI服务器失败，请确保服务器已启动，且使用--enable-cors-header参数'
    };
  }
};

// 扩展Window接口以支持File System Access API
interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  values(): AsyncIterable<FileSystemHandle>;
  getFileHandle(name: string): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

// 扩展Window接口
interface WindowWithFileSystem extends Window {
  showDirectoryPicker(options?: {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
  }): Promise<FileSystemDirectoryHandle>;
}

// 存储目录句柄的变量
let directoryHandle: FileSystemDirectoryHandle | null = null;

// 获取可用的工作流列表
const getWorkflows = async (): Promise<Workflow[]> => {
  try {
    const config = getConfig();
    
    // 如果未设置工作流路径，返回空数组
    if (!config.workflowsPath || config.workflowsPath.trim() === '') {
      console.log('未设置工作流文件夹路径');
      return [];
    }
    
    try {
      // 如果之前已经获取了目录句柄，直接使用它
      if (!directoryHandle) {
        // 如果没有目录句柄，尝试请求权限
        const accessGranted = await requestDirectoryAccess(config.workflowsPath);
        if (!accessGranted) {
          throw new Error('未获得目录访问权限');
        }
      }
      
      // 读取目录中的所有文件
      const workflows: Workflow[] = [];
      
      // 使用递归函数搜索目录及其子目录中的所有JSON文件
      const readDirectoryContents = async (dirHandle: FileSystemDirectoryHandle, path = '') => {
        for await (const entry of dirHandle.values()) {
          const entryPath = path ? `${path}/${entry.name}` : entry.name;
          
          if (entry.kind === 'directory') {
            // 递归读取子目录
            await readDirectoryContents(entry, entryPath);
          } else if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.json')) {
            try {
              // 获取文件句柄
              const fileHandle = await dirHandle.getFileHandle(entry.name);
              // 获取文件对象
              const file = await fileHandle.getFile();
              // 读取文件内容
              const content = await readFileAsText(file);
              const workflow = JSON.parse(content);
              
              // 提取工作流信息
              const id = file.name.replace(/\.json$/, '');
              const timestamp = file.lastModified / 1000;
              let name = id;
              
              // 尝试从工作流内容中提取名称
              if (workflow.prompt && workflow.prompt.extra && workflow.prompt.extra.name) {
                name = workflow.prompt.extra.name;
              } else {
                // 使用文件名作为工作流名称
                name = file.name.replace(/\.json$/, '');
              }
              
              workflows.push({
                id,
                name,
                timestamp,
                filePath: entryPath,
                fileContent: content
              });
            } catch (error) {
              console.error(`读取工作流文件出错: ${entry.name}`, error);
            }
          }
        }
      };
      
      // 开始读取目录
      if (directoryHandle) {
        await readDirectoryContents(directoryHandle);
      }
      
      // 按修改时间排序，最新的排在前面
      workflows.sort((a, b) => b.timestamp - a.timestamp);
      
      return workflows;
    } catch (error) {
      // 如果用户取消了选择或发生错误，重置目录句柄并返回空数组
      console.error('读取目录失败:', error);
      directoryHandle = null;
      return [];
    }
  } catch (error) {
    console.error('获取本地工作流列表出错:', error);
    return [];
  }
};

// 读取文件内容为文本
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('读取文件失败'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
};

interface ImageUploadResult {
  success: boolean;
  message: string;
  comfyUIUrl?: string;
  imageName?: string;
}

// 将图片发送到ComfyUI
const sendImageToComfyUI = async (
  imageUrl: string, 
  imageName: string, 
  workflowId: string | null = null
): Promise<ImageUploadResult> => {
  try {
    const config = getConfig();
    
    // 1. 获取图片Blob
    const fetchResponse = await fetch(imageUrl);
    const imageBlob = await fetchResponse.blob();
    
    // 2. 创建FormData
    const formData = new FormData();
    formData.append('image', imageBlob, imageName);
    formData.append('overwrite', 'true');
    
    // 3. 上传图片到ComfyUI
    const uploadResponse = await fetch(`${config.serverUrl}/upload/image`, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`上传图片失败: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }
    
    const uploadData = await uploadResponse.json();
    
    if (!uploadData || !uploadData.name) {
      throw new Error('上传图片失败，未获取到正确的响应数据');
    }
    
    // 4. 打开ComfyUI，指向上传的图片
    let comfyUIUrl = `${config.serverUrl}/?image=${encodeURIComponent(uploadData.name)}`;
    
    // 如果提供了工作流ID，则添加至URL
    if (workflowId) {
      comfyUIUrl += `&workflow=${encodeURIComponent(workflowId)}`;
    }
    
    // 打开ComfyUI页面
    window.open(comfyUIUrl, '_blank');
    
    return {
      success: true,
      message: '图片已成功上传并在ComfyUI中打开',
      comfyUIUrl,
      imageName: uploadData.name
    };
  } catch (error: any) {
    console.error('发送图片到ComfyUI出错:', error);
    return {
      success: false,
      message: error.message || '发送图片到ComfyUI失败',
      comfyUIUrl: ''
    };
  }
};

// 打开ComfyUI页面
const openComfyUIWithWorkflow = (workflowId: string | null = null): string => {
  const config = getConfig();
  let url = config.serverUrl;
  
  if (workflowId) {
    url += `/?workflow=${encodeURIComponent(workflowId)}`;
  }
  
  return url;
};

// 发送JSON到ComfyUI
const sendGraphDataToComfyUI = async (json: string, workflowId: string | null = null): Promise<boolean> => {
  try {
    const config = getConfig();
    const url = `${config.serverUrl}/upload/workflow`;
    const response = await fetch(url, {
      method: 'POST',
      body: json
    });
    
    if (!response.ok) {
      throw new Error(`上传工作流失败: ${response.status} ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('发送工作流到ComfyUI出错:', error);
    return false;
  }
};

// 重置目录句柄并重新请求权限
const resetDirectoryAccess = async (): Promise<boolean> => {
  directoryHandle = null;
  const config = getConfig();
  if (config.workflowsPath) {
    return await requestDirectoryAccess(config.workflowsPath);
  }
  return false;
};

export default {
  getConfig,
  saveConfig,
  checkConnection,
  getWorkflows,
  sendImageToComfyUI,
  sendGraphDataToComfyUI,
  openComfyUIWithWorkflow,
  resetDirectoryAccess
}; 