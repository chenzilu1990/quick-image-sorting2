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
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [configChanged, setConfigChanged] = useState<boolean>(false);
  
  // 从localStorage加载配置
  useEffect(() => {
    try {
      const config = comfyUIService.getConfig();
      setServerUrl(config.serverUrl || 'http://localhost:8088');
      
      // 获取当前授权目录名
      updateAuthorizedPathDisplay();
      
      setConfigChanged(false);
    } catch (error) {
      console.error('加载ComfyUI配置出错:', error);
    }
  }, []);
  
  // 更新显示的授权路径
  const updateAuthorizedPathDisplay = () => {
    // 首先尝试从当前会话获取
    const dirName = comfyUIService.getAuthorizedDirectoryName();
    if (dirName) {
      setAuthorizedPath(dirName);
      return;
    }
    
    // 如果当前会话没有，从保存的配置中获取
    const config = comfyUIService.getConfig();
    if (config.authorizedDirectoryName) {
      setAuthorizedPath(config.authorizedDirectoryName);
    } else {
      setAuthorizedPath(null);
    }
  };
  
  // 保存配置
  const saveConfig = async () => {
    if (!configChanged) return;
    
    try {
      const config: ComfyUIConfig = {
        serverUrl,
        defaultWorkflow: ''
      };
      
      // 在保存前设置"保存中"状态
      setIsSaving(true);
      setSaveMessage('正在保存...');
      
      const saved = await comfyUIService.saveConfig(config);
      
      if (saved) {
        setSaveMessage('配置已自动保存');
        setConfigChanged(false);
        
        // 更新显示的授权路径
        updateAuthorizedPathDisplay();
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
    } finally {
      setIsSaving(false);
    }
  };
  
  // 直接请求目录访问权限
  const requestDirectoryAccess = async () => {
    setIsRequesting(true);
    try {
      // 使用一个临时标识符作为路径参数
      const tempId = 'comfyui-workflows-' + Date.now();
      const result = await comfyUIService.requestDirectoryAccess(tempId);
      if (result.success) {
        setSaveMessage(`成功获取目录"${result.directoryName}"的访问权限`);
        
        // 更新配置中的授权目录名
        const config = comfyUIService.getConfig();
        config.authorizedDirectoryName = result.directoryName;
        await comfyUIService.saveConfig(config);
        
        // 更新本地状态
        setAuthorizedPath(result.directoryName || null);
        setConfigChanged(false); // 已保存，重置变更标志
      } else {
        setSaveMessage('获取目录访问权限失败');
      }
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('请求授权出错:', error);
      setSaveMessage(`授权失败: ${error.message}`);
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } finally {
      setIsRequesting(false);
    }
  };
  
  // 处理服务器URL变更 - 仅更新状态，不立即保存
  const handleServerUrlChange = (value: string) => {
    setServerUrl(value);
    setConfigChanged(true);
  };
  
  // 处理输入框失去焦点时保存
  const handleInputBlur = () => {
    if (configChanged) {
      saveConfig();
    }
  };
  
  // 测试连接
  const testConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    
    // 如果配置有改变，先保存
    if (configChanged) {
      await saveConfig();
    }
    
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
            onChange={(e) => handleServerUrlChange(e.target.value)}
            onBlur={handleInputBlur}
            placeholder="http://localhost:8088"
          />
          <p className="input-help">
            默认为 http://localhost:8088。如果您在其他地址或端口运行ComfyUI，请相应修改。
          </p>
        </div>
        
        <div className="form-group">
          <label>本地工作流文件夹</label>
          <div className="request-auth-container">
            <button 
              onClick={requestDirectoryAccess} 
              className="request-auth-btn full-width"
              disabled={isRequesting}
            >
              {isRequesting ? '请求中...' : (authorizedPath ? '更改授权目录' : '选择工作流文件夹')}
            </button>
          </div>
          
          {/* 显示已授权路径 */}
          {authorizedPath && (
            <div className="authorized-path">
              <span className="authorized-label">已授权目录:</span> 
              <span className="authorized-value">{authorizedPath}</span>
            </div>
          )}
          
          <p className="input-help">
            点击上方按钮选择您本地电脑上存储ComfyUI工作流的文件夹。
            系统会弹出文件选择器让您选择实际的工作流文件夹。您只需授权一次，系统将保存该文件夹访问权限，
            以后可以直接读取该文件夹下的所有工作流文件，无需再次选择文件夹。
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
            disabled={isTesting || isSaving}
          >
            {isTesting ? '测试中...' : '测试连接'}
          </button>
          
          <button
            onClick={openComfyUI}
            className="open-comfyui-btn"
          >
            打开ComfyUI
          </button>
        </div>
        
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('成功') || saveMessage.includes('保存') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
        
        {configChanged && (
          <div className="config-changed-indicator">
            配置已更改，失去焦点时将自动保存
          </div>
        )}
        
        {isSaving && (
          <div className="config-changed-indicator saving-indicator">
            正在自动保存...
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
            <li>点击"选择工作流文件夹"按钮</li>
            <li>在弹出的文件选择器中，选择您存储ComfyUI工作流文件的实际文件夹</li>
            <li>授权后，系统会记住您的选择，后续将自动读取该文件夹中的所有JSON文件</li>
            <li>系统会扫描该文件夹及其所有子文件夹中的JSON文件作为工作流</li>
          </ol>
          <p>
            授权是持久的，关闭浏览器后再次打开时仍然有效。如果您想切换不同的工作流文件夹，
            只需点击"更改授权目录"按钮，选择新的文件夹即可。
          </p>
        </div>
      </div>
    </main>
  );
} 