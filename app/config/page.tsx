'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 定义配置更新值的接口
interface ConfigUpdateValues {
  githubToken?: string;
  githubRepo?: string;
  githubOwner?: string;
  customApiUrl?: string;
  customApiKey?: string;
  selectedService?: string;
}

export default function Config() {
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
      
      setSaveMessage('配置已自动保存');
      setConfigChanged(false);
      setTimeout(() => setSaveMessage(''), 1500);
    } catch (error) {
      console.error('保存配置出错:', error);
      setSaveMessage('保存失败，请重试');
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
    setSaveMessage('正在测试连接...');
    
    try {
      if (selectedService === 'github') {
        // 测试GitHub API连接
        if (!githubToken || !githubRepo || !githubOwner) {
          setSaveMessage('请填写所有GitHub必填项');
          return;
        }
        
        const response = await fetch(`https://api.github.com/repos/${githubOwner}/${githubRepo}`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.ok) {
          setSaveMessage('GitHub连接成功！');
        } else {
          const errorData = await response.json();
          setSaveMessage(`GitHub连接失败: ${errorData.message || response.statusText}`);
        }
      } else if (selectedService === 'custom') {
        // 测试自定义API连接
        if (!customApiUrl) {
          setSaveMessage('请填写自定义服务器API地址');
          return;
        }
        
        // 简单的连接测试 - 实际应用可能需要调整
        const response = await fetch(customApiUrl, {
          method: 'HEAD',
          headers: customApiKey ? { 'Authorization': `Bearer ${customApiKey}` } : {}
        });
        
        if (response.ok) {
          setSaveMessage('自定义服务器连接成功！');
        } else {
          setSaveMessage(`自定义服务器连接失败: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('测试连接出错:', error);
      setSaveMessage(`连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <main className="config-page">
      <h1>图片上传服务配置</h1>
      
      <div className="config-form">
        <div className="service-selector">
          <h2>选择上传服务</h2>
          <div className="service-options">
            <label className={`service-option ${selectedService === 'github' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="service"
                value="github"
                checked={selectedService === 'github'}
                onChange={() => handleServiceChange('github')}
              />
              <span className="service-name">GitHub</span>
              <span className="service-description">将图片上传至GitHub仓库</span>
            </label>
            
            <label className={`service-option ${selectedService === 'custom' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="service"
                value="custom"
                checked={selectedService === 'custom'}
                onChange={() => handleServiceChange('custom')}
              />
              <span className="service-name">自定义服务器</span>
              <span className="service-description">上传到自定义API端点</span>
            </label>
          </div>
        </div>
        
        {selectedService === 'github' && (
          <div className="github-config">
            <h2>GitHub配置</h2>
            
            <div className="form-group">
              <label>个人访问令牌 (Personal Access Token)</label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => handleGithubTokenChange(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                onBlur={handleInputBlur}
              />
              <p className="input-help">
                需要有repo权限的GitHub令牌。
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                  如何获取Token?
                </a>
              </p>
            </div>
            
            <div className="form-group">
              <label>仓库所有者 (Owner)</label>
              <input
                type="text"
                value={githubOwner}
                onChange={(e) => handleGithubOwnerChange(e.target.value)}
                placeholder="你的GitHub用户名"
                onBlur={handleInputBlur}
              />
            </div>
            
            <div className="form-group">
              <label>仓库名称 (Repository Name)</label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => handleGithubRepoChange(e.target.value)}
                placeholder="例如: my-images"
                onBlur={handleInputBlur}
              />
            </div>
            
            <div className="path-info">
              <p className="info-text">
                <span className="info-icon">ℹ️</span> 
                存储路径将自动使用图片组的前缀名称，无需手动配置。
              </p>
            </div>
          </div>
        )}
        
        {selectedService === 'custom' && (
          <div className="custom-server-config">
            <h2>自定义服务器配置</h2>
            
            <div className="form-group">
              <label>API地址</label>
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => handleCustomApiUrlChange(e.target.value)}
                placeholder="https://example.com/api/upload"
                onBlur={handleInputBlur}
              />
              <p className="input-help">接收图片上传的API地址</p>
            </div>
            
            <div className="form-group">
              <label>API密钥 (可选)</label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => handleCustomApiKeyChange(e.target.value)}
                placeholder="你的API密钥"
                onBlur={handleInputBlur}
              />
              <p className="input-help">如果API需要认证，请提供密钥</p>
            </div>
          </div>
        )}
        
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('成功') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
        
        {configChanged && !isSaving && (
          <div className="config-changed-indicator">
            配置已更改，失去焦点时将自动保存
          </div>
        )}
        
        {isSaving && (
          <div className="config-changed-indicator saving-indicator">
            正在自动保存...
          </div>
        )}
        
        <div className="config-actions">
          <button
            onClick={testConnection}
            className="test-button"
            disabled={isSaving}
          >
            {isSaving && saveMessage.includes('测试') ? '测试中...' : '测试连接'}
          </button>
        </div>
      </div>
    </main>
  );
} 