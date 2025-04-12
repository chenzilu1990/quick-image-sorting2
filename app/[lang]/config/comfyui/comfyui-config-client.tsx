'use client';

import { useState, useEffect } from 'react';
import '@/globals.css';
import comfyUIService from '@/services/comfyuiService';
import type { ComfyUIConfig } from '@/types';
import { useDictionary } from '@/components/hooks/client-dictionary';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

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
    <main className="config-page p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">{dict.config.comfyuiTitle}</h1>
      
      <div className="config-form bg-white p-6 rounded-lg shadow space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">{dict.config.serverSettings}</h2>
        
        <div className="form-group">
          <Label htmlFor="serverUrl">{dict.config.comfyuiServer}</Label>
          <Input
            id="serverUrl"
            type="text"
            value={serverUrl}
            onChange={(e) => handleServerUrlChange(e.target.value)}
            onBlur={handleInputBlur}
            placeholder={dict.placeholders.comfyUIServer}
          />
          <p className="mt-1 text-xs text-gray-500">
            {dict.config.comfyuiServerHelp}
          </p>
        </div>
        
        <div className="form-group">
          <Label htmlFor="workflowFolder">{dict.config.workflowFolder}</Label>
          <div className="request-auth-container mt-1"> 
            <button 
              onClick={requestDirectoryAccess} 
              className="request-auth-btn full-width inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed w-full"
              disabled={isRequesting}
            >
              {isRequesting ? dict.buttons.requesting : (authorizedPath ? dict.buttons.changeFolder : dict.buttons.selectFolder)}
            </button>
          </div>
          
          {authorizedPath && (
            <div className="authorized-path mt-2 p-2 bg-gray-100 border border-gray-200 rounded text-sm">
              <span className="authorized-label font-medium text-gray-700">{dict.config.authorizedDir}:</span> 
              <span className="authorized-value ml-2 text-gray-900 font-mono">{authorizedPath}</span>
            </div>
          )}
          
          <p className="mt-1 text-xs text-gray-500">
            {dict.config.workflowFolderHelp}
          </p>
        </div>
        
        {connectionStatus && (
          <div className={`connection-status mt-4 p-3 rounded text-sm ${connectionStatus.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="status-indicator">
              {connectionStatus.status
                ? dict.status.connectionSuccess.replace('{version}', connectionStatus.data?.cuda?.version || '')
                : dict.status.connectionFailed.replace('{message}', connectionStatus.message)}
            </div>
          </div>
        )}
        
        <div className="comfyui-actions flex gap-4 pt-4 border-t">
          <Button
            variant="success"
            onClick={testConnection}
            disabled={isTesting || isSaving}
          >
            {isTesting ? dict.buttons.testing : dict.buttons.testConnection}
          </Button>
          
          <Button
            variant="secondary"
            onClick={openComfyUI}
          >
            {dict.buttons.openComfyUI}
          </Button>
        </div>
        
        {saveMessage && (
          <div className={`save-message mt-2 p-2 rounded text-sm ${saveMessage.includes('✓') || saveMessage.includes(dict.status.configSaved) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {saveMessage}
          </div>
        )}
        
        {configChanged && !isSaving && (
          <div className="config-changed-indicator mt-1 text-sm text-yellow-600">
            {dict.status.configChanged}
          </div>
        )}
        
        {isSaving && saveMessage !== dict.buttons.saving && (
          <div className="config-changed-indicator saving-indicator mt-1 text-sm text-gray-500 animate-pulse">
            {dict.status.autoSaving}
          </div>
        )}
        
        <div className="usage-instructions mt-6 pt-4 border-t space-y-3 text-sm text-gray-700">
          <h3 className="text-lg font-semibold text-gray-900">{dict.config.usageInstructions}</h3>
          <p>
            {dict.config.corsInstructions}
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong className="font-medium text-gray-900">{dict.config.stepsList.important.split('：')[0]}：</strong>{dict.config.stepsList.important.split('：')[1]}</li>
            <li>{dict.config.stepsList.example}</li>
            <li>{dict.config.stepsList.setServer}</li>
            <li>{dict.config.stepsList.setFolder}</li>
            <li>{dict.config.stepsList.saveAndTest}</li>
          </ol>
          <p className="warning p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            {dict.config.corsWarning}
          </p>
          
          <h4 className="text-md font-semibold text-gray-900 pt-2">{dict.config.workflowFolderInfo}</h4>
          <p>
            {dict.config.accessFlowInfo}
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>{dict.config.accessStepsList.clickButton}</li>
            <li>{dict.config.accessStepsList.selectFolder}</li>
            <li>{dict.config.accessStepsList.remember}</li>
            <li>{dict.config.accessStepsList.scan}</li>
          </ol>
          <p>
            {dict.config.authPersistenceInfo}
          </p>
        </div>
      </div>
    </main>
  );
} 