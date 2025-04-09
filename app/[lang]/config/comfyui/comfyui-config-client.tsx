'use client';

import { useState, useEffect } from 'react';
import '../../../globals.css';
import comfyUIService from '../../../services/comfyuiService';
import type { ComfyUIConfig } from '../../../types';
import { useDictionary } from '../../components/client-dictionary';

interface ConnectionStatus {
  status: boolean;
  message: string;
  data?: any;
}

export default function ComfyUIConfigClient() {
  const dict = useDictionary();
  
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
      setSaveMessage(dict.buttons.saving);
      
      const saved = await comfyUIService.saveConfig(config);
      
      if (saved) {
        setSaveMessage(dict.status.configSaved);
        setConfigChanged(false);
        
        // 更新显示的授权路径
        updateAuthorizedPathDisplay();
      } else {
        setSaveMessage(dict.status.saveFailed);
      }
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('保存配置出错:', error);
      setSaveMessage(dict.errors.saveConfigError.replace('{message}', error.message));
      
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
        setSaveMessage(dict.status.accessGranted.replace('{directory}', result.directoryName || ''));
        
        // 更新配置中的授权目录名
        const config = comfyUIService.getConfig();
        config.authorizedDirectoryName = result.directoryName;
        await comfyUIService.saveConfig(config);
        
        // 更新本地状态
        setAuthorizedPath(result.directoryName || null);
        setConfigChanged(false); // 已保存，重置变更标志
      } else {
        setSaveMessage(dict.status.accessFailed);
      }
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('请求授权出错:', error);
      setSaveMessage(dict.status.authError.replace('{message}', error.message));
      
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
        message: error.message || dict.status.connectionFailed.replace('{message}', '')
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
      <h1>{dict.config.comfyuiTitle}</h1>
      
      <div className="config-form">
        <h2>{dict.config.serverSettings}</h2>
        
        <div className="form-group">
          <label>{dict.config.comfyuiServer}</label>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => handleServerUrlChange(e.target.value)}
            onBlur={handleInputBlur}
            placeholder={dict.placeholders.comfyUIServer}
          />
          <p className="input-help">
            {dict.config.comfyuiServerHelp}
          </p>
        </div>
        
        <div className="form-group">
          <label>{dict.config.workflowFolder}</label>
          <div className="request-auth-container">
            <button 
              onClick={requestDirectoryAccess} 
              className="request-auth-btn full-width"
              disabled={isRequesting}
            >
              {isRequesting ? dict.buttons.requesting : (authorizedPath ? dict.buttons.changeFolder : dict.buttons.selectFolder)}
            </button>
          </div>
          
          {/* 显示已授权路径 */}
          {authorizedPath && (
            <div className="authorized-path">
              <span className="authorized-label">{dict.config.authorizedDir}</span> 
              <span className="authorized-value">{authorizedPath}</span>
            </div>
          )}
          
          <p className="input-help">
            {dict.config.workflowFolderHelp}
          </p>
        </div>
        
        {/* 显示连接状态 */}
        {connectionStatus && (
          <div className={`connection-status ${connectionStatus.status ? 'success' : 'error'}`}>
            <div className="status-indicator">
              {connectionStatus.status
                ? dict.status.connectionSuccess.replace('{version}', connectionStatus.data?.cuda?.version || '')
                : dict.status.connectionFailed.replace('{message}', connectionStatus.message)}
            </div>
          </div>
        )}
        
        <div className="comfyui-actions">
          <button
            onClick={testConnection}
            className="test-button"
            disabled={isTesting || isSaving}
          >
            {isTesting ? dict.buttons.testing : dict.buttons.testConnection}
          </button>
          
          <button
            onClick={openComfyUI}
            className="open-comfyui-btn"
          >
            {dict.buttons.openComfyUI}
          </button>
        </div>
        
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('✓') || saveMessage.includes(dict.status.configSaved) ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
        
        {configChanged && (
          <div className="config-changed-indicator">
            {dict.status.configChanged}
          </div>
        )}
        
        {isSaving && (
          <div className="config-changed-indicator saving-indicator">
            {dict.status.autoSaving}
          </div>
        )}
        
        <div className="usage-instructions">
          <h3>{dict.config.usageInstructions}</h3>
          <p>
            {dict.config.corsInstructions}
          </p>
          <ol>
            <li><strong>重要：</strong>启动ComfyUI时必须添加<code>--enable-cors-header</code>参数</li>
            <li>例如：<code>python main.py --enable-cors-header</code></li>
            <li>设置正确的ComfyUI服务器地址</li>
            <li>填写您存储ComfyUI工作流文件的本地文件夹路径</li>
            <li>点击"保存配置"，然后测试连接</li>
          </ol>
          <p className="warning">
            {dict.config.corsWarning}
          </p>
          
          <h4>{dict.config.workflowFolderInfo}</h4>
          <p>
            {dict.config.accessFlowInfo}
          </p>
          <ol>
            <li>点击"选择工作流文件夹"按钮</li>
            <li>在弹出的文件选择器中，选择您存储ComfyUI工作流文件的实际文件夹</li>
            <li>授权后，系统会记住您的选择，后续将自动读取该文件夹中的所有JSON文件</li>
            <li>系统会扫描该文件夹及其所有子文件夹中的JSON文件作为工作流</li>
          </ol>
          <p>
            {dict.config.authPersistenceInfo}
          </p>
        </div>
      </div>
    </main>
  );
} 