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
  const [workflowsPath, setWorkflowsPath] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  
  // 从localStorage加载配置
  useEffect(() => {
    try {
      const config = comfyUIService.getConfig();
      setServerUrl(config.serverUrl || 'http://localhost:8088');
      setWorkflowsPath(config.workflowsPath || '');
    } catch (error) {
      console.error('加载ComfyUI配置出错:', error);
    }
  }, []);
  
  // 保存配置
  const saveConfig = async () => {
    try {
      const config: ComfyUIConfig = {
        serverUrl,
        defaultWorkflow: '',
        workflowsPath
      };
      
      // 在保存前设置"保存中"状态
      setSaveMessage('正在保存...');
      
      const saved = await comfyUIService.saveConfig(config);
      
      if (saved) {
        setSaveMessage('配置已保存，并已请求工作流文件夹访问权限');
      } else {
        setSaveMessage('保存失败，请重试');
      }
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('保存配置出错:', error);
      setSaveMessage('保存失败: ' + error.message);
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
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
        
        <div className="form-group">
          <label>本地工作流文件夹路径</label>
          <input
            type="text"
            value={workflowsPath}
            onChange={(e) => setWorkflowsPath(e.target.value)}
            placeholder="workflows"
          />
          <p className="input-help">
            输入您本地电脑上存储ComfyUI工作流的文件夹名称或描述性标识。在保存配置时，系统会立即弹出文件选择器让您
            选择实际的工作流文件夹。您只需授权一次，系统将保存该文件夹访问权限，以后可以直接读取该文件夹下的所有工作流文件，
            无需再次选择文件夹。
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
            <li>填写您存储ComfyUI工作流文件的本地文件夹路径</li>
            <li>点击"保存配置"，然后测试连接</li>
          </ol>
          <p className="warning">
            如果不添加<code>--enable-cors-header</code>参数，将会出现跨域错误，无法直接与ComfyUI通信！
          </p>
          
          <h4>关于本地工作流文件夹</h4>
          <p>
            本应用使用现代Web API直接读取您电脑上的工作流文件，具体访问流程如下：
          </p>
          <ol>
            <li>您在配置页面设置一个工作流文件夹名称（仅作为标识，无需是实际路径）</li>
            <li><strong>保存配置时，</strong>系统会立即请求文件系统访问权限，弹出文件选择器</li>
            <li>选择您存储ComfyUI工作流文件的实际文件夹</li>
            <li>授权后，系统会记住您的选择，后续将自动读取该文件夹中的所有JSON文件</li>
            <li>系统会扫描该文件夹及其所有子文件夹中的JSON文件作为工作流</li>
          </ol>
          <p>
            授权是持久的，关闭浏览器后再次打开时仍然有效。如果您想切换不同的工作流文件夹，
            只需在这里修改文件夹路径并保存即可，系统会自动请求新的文件夹访问权限。
          </p>
        </div>
      </div>
    </main>
  );
} 