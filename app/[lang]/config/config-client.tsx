'use client';

import { useState, useEffect } from 'react';
import { useDictionary } from '../../components/client-dictionary';

// 定义配置更新值的接口
interface ConfigUpdateValues {
  githubToken?: string;
  githubRepo?: string;
  githubOwner?: string;
  customApiUrl?: string;
  customApiKey?: string;
  selectedService?: string;
}

export default function ConfigClient() {
  const dict = useDictionary();
  
  // GitHub配置
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  
  // 自定义服务器配置
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  
  // 选择当前使用的服务类型
  const [selectedService, setSelectedService] = useState('github');
  
  // 状态提示
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [configChanged, setConfigChanged] = useState(false);
  
  // 从localStorage加载配置
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('imageUploaderConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        
        // 加载GitHub配置
        if (config.github) {
          setGithubToken(config.github.token || '');
          setGithubRepo(config.github.repo || '');
          setGithubOwner(config.github.owner || '');
        }
        
        // 加载自定义服务器配置
        if (config.customServer) {
          setCustomApiUrl(config.customServer.apiUrl || '');
          setCustomApiKey(config.customServer.apiKey || '');
        }
        
        // 加载选择的服务类型
        if (config.selectedService) {
          setSelectedService(config.selectedService);
        }
      }
    } catch (error) {
      console.error('加载配置出错:', error);
    }
  }, []);
  
  // 保存配置到localStorage
  const saveConfig = (updatedValues: ConfigUpdateValues = {}) => {
    setIsSaving(true);
    
    try {
      // 合并当前状态和传入的更新值
      const updatedGithubToken = updatedValues.githubToken !== undefined ? updatedValues.githubToken : githubToken;
      const updatedGithubRepo = updatedValues.githubRepo !== undefined ? updatedValues.githubRepo : githubRepo;
      const updatedGithubOwner = updatedValues.githubOwner !== undefined ? updatedValues.githubOwner : githubOwner;
      const updatedCustomApiUrl = updatedValues.customApiUrl !== undefined ? updatedValues.customApiUrl : customApiUrl;
      const updatedCustomApiKey = updatedValues.customApiKey !== undefined ? updatedValues.customApiKey : customApiKey;
      const updatedSelectedService = updatedValues.selectedService !== undefined ? updatedValues.selectedService : selectedService;
      
      const config = {
        selectedService: updatedSelectedService,
        github: {
          token: updatedGithubToken,
          repo: updatedGithubRepo,
          owner: updatedGithubOwner
        },
        customServer: {
          apiUrl: updatedCustomApiUrl,
          apiKey: updatedCustomApiKey
        },
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('imageUploaderConfig', JSON.stringify(config));
      
      setSaveMessage(dict.status.configSaved);
      setConfigChanged(false);
      setTimeout(() => setSaveMessage(''), 1500);
    } catch (error) {
      console.error('保存配置出错:', error);
      setSaveMessage(dict.status.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };
  
  // 处理服务类型变更 - 直接变更时保存
  const handleServiceChange = (service: string) => {
    setSelectedService(service);
    saveConfig({ selectedService: service });
  };
  
  // 处理GitHub配置变更 - 仅存储状态，不立即保存
  const handleGithubTokenChange = (value: string) => {
    setGithubToken(value);
    setConfigChanged(true);
  };
  
  const handleGithubRepoChange = (value: string) => {
    setGithubRepo(value);
    setConfigChanged(true);
  };
  
  const handleGithubOwnerChange = (value: string) => {
    setGithubOwner(value);
    setConfigChanged(true);
  };
  
  // 处理自定义服务器配置变更 - 仅存储状态，不立即保存
  const handleCustomApiUrlChange = (value: string) => {
    setCustomApiUrl(value);
    setConfigChanged(true);
  };
  
  const handleCustomApiKeyChange = (value: string) => {
    setCustomApiKey(value);
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
    setIsSaving(true);
    setSaveMessage(dict.buttons.testing);
    
    try {
      if (selectedService === 'github') {
        // 测试GitHub API连接
        if (!githubToken || !githubRepo || !githubOwner) {
          setSaveMessage(dict.errors.missingGithubFields);
          return;
        }
        
        const response = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.ok) {
          setSaveMessage(dict.status.connectionSuccess.replace('{version}', ''));
        } else {
          const errorData = await response.json();
          setSaveMessage(dict.status.connectionFailed.replace('{message}', errorData.message || response.statusText));
        }
      } else if (selectedService === 'custom') {
        // 测试自定义API连接
        if (!customApiUrl) {
          setSaveMessage(dict.errors.missingApiUrl);
          return;
        }
        
        // 简单的连接测试 - 实际应用可能需要调整
        const response = await fetch(customApiUrl, {
          method: 'HEAD',
          headers: customApiKey ? { 'Authorization': `Bearer ${customApiKey}` } : {}
        });
        
        if (response.ok) {
          setSaveMessage(dict.status.connectionSuccess.replace('{version}', ''));
        } else {
          setSaveMessage(dict.status.connectionFailed.replace('{message}', response.statusText));
        }
      }
    } catch (error) {
      console.error('测试连接出错:', error);
      setSaveMessage(dict.status.connectionFailed.replace('{message}', error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <main className="config-page">
      <h1>{dict.config.title}</h1>
      
      <div className="config-form">
        <div className="service-selector">
          <h2>{dict.config.serviceSelector}</h2>
          <div className="service-options">
            <label className={`service-option ${selectedService === 'github' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="service"
                value="github"
                checked={selectedService === 'github'}
                onChange={() => handleServiceChange('github')}
              />
              <span className="service-name">{dict.config.githubService}</span>
              <span className="service-description">{dict.config.githubDesc}</span>
            </label>
            
            <label className={`service-option ${selectedService === 'custom' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="service"
                value="custom"
                checked={selectedService === 'custom'}
                onChange={() => handleServiceChange('custom')}
              />
              <span className="service-name">{dict.config.customService}</span>
              <span className="service-description">{dict.config.customDesc}</span>
            </label>
          </div>
        </div>
        
        {selectedService === 'github' && (
          <div className="github-config">
            <h2>{dict.config.githubConfig}</h2>
            
            <div className="form-group">
              <label>{dict.config.githubToken}</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => handleGithubTokenChange(e.target.value)}
                placeholder={dict.placeholders.githubToken}
                onBlur={handleInputBlur}
              />
              <p className="input-help">
                {dict.config.githubTokenHelp}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                  {dict.config.howToGetToken}
                </a>
              </p>
            </div>
            
            <div className="form-group">
              <label>{dict.config.githubOwner}</label>
              <input
                type="text"
                value={githubOwner}
                onChange={(e) => handleGithubOwnerChange(e.target.value)}
                placeholder={dict.placeholders.githubOwner}
                onBlur={handleInputBlur}
              />
            </div>
            
            <div className="form-group">
              <label>{dict.config.githubRepo}</label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => handleGithubRepoChange(e.target.value)}
                placeholder={dict.placeholders.githubRepo}
                onBlur={handleInputBlur}
              />
            </div>
            
            <div className="path-info">
              <p className="info-text">
                <span className="info-icon">ℹ️</span> 
                {dict.config.githubPathInfo}
              </p>
            </div>
          </div>
        )}
        
        {selectedService === 'custom' && (
          <div className="custom-server-config">
            <h2>{dict.config.customConfig}</h2>
            
            <div className="form-group">
              <label>{dict.config.apiUrl}</label>
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => handleCustomApiUrlChange(e.target.value)}
                placeholder={dict.placeholders.customApiUrl}
                onBlur={handleInputBlur}
              />
              <p className="input-help">{dict.config.apiUrlHelp}</p>
            </div>
            
            <div className="form-group">
              <label>{dict.config.apiKey}</label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => handleCustomApiKeyChange(e.target.value)}
                placeholder={dict.placeholders.customApiKey}
                onBlur={handleInputBlur}
              />
              <p className="input-help">{dict.config.apiKeyHelp}</p>
            </div>
          </div>
        )}
        
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('✓') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
        
        {configChanged && !isSaving && (
          <div className="config-changed-indicator">
            {dict.status.configChanged}
          </div>
        )}
        
        {isSaving && (
          <div className="config-changed-indicator saving-indicator">
            {dict.status.autoSaving}
          </div>
        )}
        
        <div className="config-actions">
          <button
            onClick={testConnection}
            className="test-button"
            disabled={isSaving}
          >
            {isSaving && saveMessage.includes(dict.buttons.testing) ? dict.buttons.testing : dict.buttons.testConnection}
          </button>
        </div>
      </div>
    </main>
  );
} 