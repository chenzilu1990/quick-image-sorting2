'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../globals.css';
import comfyUIService from '../../services/comfyuiService';
import type { ComfyUIConfig } from '@/types';

interface ConnectionStatus {
  status: boolean;
  message: string;
  data?: any;
}

export default function ComfyUIConfig() {
  // ComfyUI配置
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:8088');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  
  // 从localStorage加载配置
  useEffect(() => {
    try {
      const config = comfyUIService.getConfig();
      setServerUrl(config.serverUrl || 'http://localhost:8088');
    } catch (error) {
      console.error('加载ComfyUI配置出错:', error);
    }
  }, []);
  
  // 保存配置
  const saveConfig = () => {
    try {
      const config: ComfyUIConfig = {
        serverUrl,
        defaultWorkflow: ''
      };
      
      const saved = comfyUIService.saveConfig(config);
      
      if (saved) {
        setSaveMessage('配置已保存');
      } else {
        setSaveMessage('保存失败，请重试');
      }
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('保存配置出错:', error);
      setSaveMessage('保存失败: ' + error.message);
    }
  };
  
  // 测试连接
  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    
    try {
      const result = await comfyUIService.checkConnection();
      setConnectionStatus(result);
    } catch (error: any) {
      setConnectionStatus({
        status: false,
        message: error.message || '连接测试失败'
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // 打开ComfyUI
  const openComfyUI = () => {
    window.open(serverUrl, '_blank');
  };
  
  return (
    <main className="config-page">
      <h1>ComfyUI 配置</h1>
      
      <Link href="/" className="back-link">
        &larr; 返回主页
      </Link>
      
      <div className="config-form">
        <h2>服务器设置</h2>
        
        <div className="form-group">
          <label>ComfyUI 服务器地址</label>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:8088"
          />
          <p className="input-help">
            默认为 http://localhost:8088。如果您在其他地址或端口运行ComfyUI，请相应修改。
          </p>
        </div>
        
        {/* 显示连接状态 */}
        {connectionStatus && (
          <div className={`connection-status ${connectionStatus.status ? 'success' : 'error'}`}>
            <div className="status-indicator">
              {connectionStatus.status
                ? `✓ 连接成功：已连接到 ComfyUI ${connectionStatus.data?.cuda?.version || ''}`
                : `✗ 连接失败：${connectionStatus.message}`}
            </div>
          </div>
        )}
        
        <div className="comfyui-actions">
          <button
            onClick={testConnection}
            className="test-button"
            disabled={isTesting}
          >
            {isTesting ? '测试中...' : '测试连接'}
          </button>
          
          <button
            onClick={openComfyUI}
            className="open-comfyui-btn"
          >
            打开ComfyUI
          </button>
          
          <button
            onClick={saveConfig}
            className="save-button"
          >
            保存配置
          </button>
        </div>
        
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('成功') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
        
        <div className="usage-instructions">
          <h3>使用说明</h3>
          <p>
            为了解决跨域限制问题，请按以下步骤设置：
          </p>
          <ol>
            <li><strong>重要：</strong>启动ComfyUI时必须添加<code>--enable-cors-header</code>参数</li>
            <li>例如：<code>python main.py --enable-cors-header</code></li>
            <li>设置正确的ComfyUI服务器地址</li>
            <li>点击"保存配置"，然后测试连接</li>
          </ol>
          <p className="warning">
            如果不添加<code>--enable-cors-header</code>参数，将会出现跨域错误，无法直接与ComfyUI通信！
          </p>
        </div>
      </div>
    </main>
  );
} 