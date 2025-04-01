import { ComfyUIConfig } from '@/types';

// 定义消息类型
export interface ComfyUIMessage {
  type: 'image' | 'workflow' | 'status' | 'error';
  data: any;
}

class ComfyUIMessageService {
  private comfyUIWindow: Window | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private isClient: boolean;

  constructor() {
    // 检查是否在客户端
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      // 只在客户端添加消息监听器
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  // 打开ComfyUI窗口
  openComfyUIWindow(url: string): Window | null {
    if (!this.isClient) {
      console.warn('ComfyUI消息服务只能在客户端使用');
      return null;
    }
    
    this.comfyUIWindow = window.open(url, 'comfyui');
    return this.comfyUIWindow;
  }

  // 发送消息到ComfyUI
  sendMessage(message: ComfyUIMessage): void {
    if (!this.isClient) {
      console.warn('ComfyUI消息服务只能在客户端使用');
      return;
    }

    if (this.comfyUIWindow) {
      this.comfyUIWindow.postMessage(message, '*');
    } else {
      console.error('ComfyUI窗口未打开');
    }
  }

  // 处理来自ComfyUI的消息
  private handleMessage(event: MessageEvent): void {
    if (!this.isClient) return;

    // 验证消息来源
    const config = this.getConfig();
    if (event.origin !== config.serverUrl) {
      console.warn('收到来自未知来源的消息:', event.origin);
      return;
    }

    const { type, data } = event.data;
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    }
  }

  // 注册消息处理器
  on(type: string, handler: (data: any) => void): void {
    if (!this.isClient) {
      console.warn('ComfyUI消息服务只能在客户端使用');
      return;
    }
    this.messageHandlers.set(type, handler);
  }

  // 移除消息处理器
  off(type: string): void {
    if (!this.isClient) {
      console.warn('ComfyUI消息服务只能在客户端使用');
      return;
    }
    this.messageHandlers.delete(type);
  }

  // 获取ComfyUI配置
  private getConfig(): ComfyUIConfig {
    if (!this.isClient) {
      return {
        serverUrl: 'http://localhost:8088',
        defaultWorkflow: '',
        workflowsPath: ''
      };
    }
    
    try {
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
  }

  // 关闭ComfyUI窗口
  closeComfyUIWindow(): void {
    if (!this.isClient) {
      console.warn('ComfyUI消息服务只能在客户端使用');
      return;
    }

    if (this.comfyUIWindow) {
      this.comfyUIWindow.close();
      this.comfyUIWindow = null;
    }
  }
}

// 创建单例实例
const comfyUIMessageService = new ComfyUIMessageService();
export default comfyUIMessageService; 