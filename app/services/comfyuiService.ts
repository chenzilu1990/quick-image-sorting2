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
        defaultWorkflow: ''
      };
    }
    
    const savedConfig = localStorage.getItem('comfyUIConfig');
    if (!savedConfig) {
      return {
        serverUrl: 'http://localhost:8088',
        defaultWorkflow: ''
      };
    }
    return JSON.parse(savedConfig) as ComfyUIConfig;
  } catch (error) {
    console.error('获取ComfyUI配置出错:', error);
    return {
      serverUrl: 'http://localhost:8088',
      defaultWorkflow: ''
    };
  }
};

// 保存ComfyUI配置
const saveConfig = (config: ComfyUIConfig): boolean => {
  try {
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

// 获取可用的工作流列表
const getWorkflows = async (): Promise<Workflow[]> => {
  try {
    const config = getConfig();
    const response = await fetch(`${config.serverUrl}/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`获取工作流失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 转换为更易用的格式
    const workflows = Object.entries(data)
      .map(([id, info]: [string, any]) => ({
        id,
        timestamp: info.timestamp || Date.now() / 1000,
        name: info.prompt?.extra?.name || `工作流 ${id.substring(0, 8)}`
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return workflows;
  } catch (error) {
    console.error('获取工作流列表出错:', error);
    return [];
  }
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

export default {
  getConfig,
  saveConfig,
  checkConnection,
  getWorkflows,
  sendImageToComfyUI,
  openComfyUIWithWorkflow
}; 