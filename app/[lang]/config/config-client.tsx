'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDictionary } from '@/components/hooks/client-dictionary';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
// 移除 Image 导入
// 导入lucide-react图标
import {
  Github,
  Database,
  Cloud,
  Aperture,
  Users,
  Settings
} from 'lucide-react';
import UploadServiceGuide from '@/components/config/UploadServiceGuide';

// 定义配置更新值的接口
interface ConfigUpdateValues {
  githubToken?: string;
  githubRepo?: string;
  githubOwner?: string;
  customApiUrl?: string;
  customApiKey?: string;
  selectedService?: string;
  // S3相关配置
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Bucket?: string;
  s3Region?: string;
  // 腾讯云COS配置
  cosSecretId?: string;
  cosSecretKey?: string;
  cosBucket?: string;
  cosRegion?: string;
  // 阿里云OSS配置
  ossAccessKey?: string;
  ossSecretKey?: string;
  ossBucket?: string;
  ossRegion?: string;
  // 七牛云配置
  qiniuAccessKey?: string;
  qiniuSecretKey?: string;
  qiniuBucket?: string;
  qiniuDomain?: string;
}

// 定义图床服务类型
interface ImageBedService {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode; // 修改为ReactNode类型
}

// 将 FormGroup 组件移到 ConfigClient 外部（或模块作用域内）
const FormGroup: React.FC<{
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  helpText?: React.ReactNode;
}> = ({ label, htmlFor, children, helpText }) => (
  <div className="mb-4">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
  </div>
);

export default function ConfigClient() {
  const dict = useDictionary();
  
  // 定义支持的图床服务列表
  const imageBedServices: ImageBedService[] = [
    {
      id: 'github',
      name: 'GitHub',
      description: dict.config.githubDesc || 'GitHub图床',
      icon: <Github size={24} /> // 使用Github图标组件
    },
    {
      id: 'aws',
      name: 'AWS S3',
      description: dict.config.awsDesc || 'Amazon S3对象存储',
      icon: <Database size={24} /> // 使用Database图标代表AWS S3
    },
    {
      id: 'tencent',
      name: dict.config.tencentName || '腾讯云COS',
      description: dict.config.tencentDesc || '腾讯云对象存储',
      icon: <Cloud size={24} /> // 使用Cloud图标代表腾讯云
    },
    {
      id: 'aliyun',
      name: dict.config.aliyunName || '阿里云OSS',
      description: dict.config.aliyunDesc || '阿里云对象存储',
      icon: <Cloud size={24} /> // 使用Cloud图标代表阿里云
    },
    {
      id: 'qiniu',
      name: dict.config.qiniuName || '七牛云',
      description: dict.config.qiniuDesc || '七牛云对象存储',
      icon: <Aperture size={24} /> // 使用Aperture图标代表七牛云
    },
    {
      id: 'custom',
      name: dict.config.customService || '自定义服务',
      description: dict.config.customDesc || '自定义API服务',
      icon: <Settings size={24} /> // 使用Settings图标代表自定义服务
    }
  ];
  
  // GitHub配置
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  
  // AWS S3配置
  const [s3AccessKey, setS3AccessKey] = useState('');
  const [s3SecretKey, setS3SecretKey] = useState('');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Region, setS3Region] = useState('');
  
  // 腾讯云COS配置
  const [cosSecretId, setCosSecretId] = useState('');
  const [cosSecretKey, setCosSecretKey] = useState('');
  const [cosBucket, setCosBucket] = useState('');
  const [cosRegion, setCosRegion] = useState('');
  
  // 阿里云OSS配置
  const [ossAccessKey, setOssAccessKey] = useState('');
  const [ossSecretKey, setOssSecretKey] = useState('');
  const [ossBucket, setOssBucket] = useState('');
  const [ossRegion, setOssRegion] = useState('');
  
  // 七牛云配置
  const [qiniuAccessKey, setQiniuAccessKey] = useState('');
  const [qiniuSecretKey, setQiniuSecretKey] = useState('');
  const [qiniuBucket, setQiniuBucket] = useState('');
  const [qiniuDomain, setQiniuDomain] = useState('');
  
  // 自定义服务器配置
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  
  // 选择当前使用的服务类型
  const [selectedService, setSelectedService] = useState('github');
  
  // 状态提示
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [configChanged, setConfigChanged] = useState(false);
  
  // 用于 debounce 的 Ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs to hold the latest values for the cleanup function
  const configChangedRef = useRef(configChanged);
  // Need to define saveConfig first, so initialize ref later or update in effect
  const saveConfigRef = useRef<typeof saveConfig>(() => {}); // Placeholder function
  
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
        
        // 加载AWS S3配置
        if (config.aws) {
          setS3AccessKey(config.aws.accessKey || '');
          setS3SecretKey(config.aws.secretKey || '');
          setS3Bucket(config.aws.bucket || '');
          setS3Region(config.aws.region || '');
        }
        
        // 加载腾讯云COS配置
        if (config.tencent) {
          setCosSecretId(config.tencent.secretId || '');
          setCosSecretKey(config.tencent.secretKey || '');
          setCosBucket(config.tencent.bucket || '');
          setCosRegion(config.tencent.region || '');
        }
        
        // 加载阿里云OSS配置
        if (config.aliyun) {
          setOssAccessKey(config.aliyun.accessKey || '');
          setOssSecretKey(config.aliyun.secretKey || '');
          setOssBucket(config.aliyun.bucket || '');
          setOssRegion(config.aliyun.region || '');
        }
        
        // 加载七牛云配置
        if (config.qiniu) {
          setQiniuAccessKey(config.qiniu.accessKey || '');
          setQiniuSecretKey(config.qiniu.secretKey || '');
          setQiniuBucket(config.qiniu.bucket || '');
          setQiniuDomain(config.qiniu.domain || '');
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
  
  // 保存配置到localStorage - 改为 useCallback
  const saveConfig = useCallback((updatedValues: ConfigUpdateValues = {}) => {
    // 如果已经在保存中，则取消（或者可以排队，但现在先取消）
    if (isSaving) return; 
    
    setIsSaving(true);
    setSaveMessage(dict.status.autoSaving || '自动保存中...'); // 提供即时反馈

    try {
      // 清除任何待处理的超时
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      
      // 合并当前状态和传入的更新值
      const updatedSelectedService = updatedValues.selectedService !== undefined ? updatedValues.selectedService : selectedService;
      
      const config = {
        selectedService: updatedSelectedService,
        github: {
          token: updatedValues.githubToken !== undefined ? updatedValues.githubToken : githubToken,
          repo: updatedValues.githubRepo !== undefined ? updatedValues.githubRepo : githubRepo,
          owner: updatedValues.githubOwner !== undefined ? updatedValues.githubOwner : githubOwner
        },
        aws: {
          accessKey: updatedValues.s3AccessKey !== undefined ? updatedValues.s3AccessKey : s3AccessKey,
          secretKey: updatedValues.s3SecretKey !== undefined ? updatedValues.s3SecretKey : s3SecretKey,
          bucket: updatedValues.s3Bucket !== undefined ? updatedValues.s3Bucket : s3Bucket,
          region: updatedValues.s3Region !== undefined ? updatedValues.s3Region : s3Region
        },
        tencent: {
          secretId: updatedValues.cosSecretId !== undefined ? updatedValues.cosSecretId : cosSecretId,
          secretKey: updatedValues.cosSecretKey !== undefined ? updatedValues.cosSecretKey : cosSecretKey,
          bucket: updatedValues.cosBucket !== undefined ? updatedValues.cosBucket : cosBucket,
          region: updatedValues.cosRegion !== undefined ? updatedValues.cosRegion : cosRegion
        },
        aliyun: {
          accessKey: updatedValues.ossAccessKey !== undefined ? updatedValues.ossAccessKey : ossAccessKey,
          secretKey: updatedValues.ossSecretKey !== undefined ? updatedValues.ossSecretKey : ossSecretKey,
          bucket: updatedValues.ossBucket !== undefined ? updatedValues.ossBucket : ossBucket,
          region: updatedValues.ossRegion !== undefined ? updatedValues.ossRegion : ossRegion
        },
        qiniu: {
          accessKey: updatedValues.qiniuAccessKey !== undefined ? updatedValues.qiniuAccessKey : qiniuAccessKey,
          secretKey: updatedValues.qiniuSecretKey !== undefined ? updatedValues.qiniuSecretKey : qiniuSecretKey,
          bucket: updatedValues.qiniuBucket !== undefined ? updatedValues.qiniuBucket : qiniuBucket,
          domain: updatedValues.qiniuDomain !== undefined ? updatedValues.qiniuDomain : qiniuDomain
        },
        customServer: {
          apiUrl: updatedValues.customApiUrl !== undefined ? updatedValues.customApiUrl : customApiUrl,
          apiKey: updatedValues.customApiKey !== undefined ? updatedValues.customApiKey : customApiKey
        },
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('imageUploaderConfig', JSON.stringify(config));
      
      setSaveMessage(dict.status.configSaved);
      setConfigChanged(false); // 标记更改已保存
      setTimeout(() => setSaveMessage(''), 1500);
    } catch (error) {
      console.error('保存配置出错:', error);
      setSaveMessage(dict.status.saveFailed);
    } finally {
      setIsSaving(false);
    }
  // 依赖项应包含所有状态变量和 dict
  }, [
      selectedService, githubToken, githubRepo, githubOwner, 
      s3AccessKey, s3SecretKey, s3Bucket, s3Region,
      cosSecretId, cosSecretKey, cosBucket, cosRegion,
      ossAccessKey, ossSecretKey, ossBucket, ossRegion,
      qiniuAccessKey, qiniuSecretKey, qiniuBucket, qiniuDomain,
      customApiUrl, customApiKey, dict, isSaving // 添加 isSaving
  ]);

  // Update refs with latest values after saveConfig is defined and potentially memoized
  useEffect(() => {
    configChangedRef.current = configChanged;
    saveConfigRef.current = saveConfig;
  }); // Runs on every render to capture latest state and function

  // Debounced 保存函数
  const debouncedSave = useCallback(() => {
    // 清除之前的计时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // 设置新的计时器，延迟 1 秒后保存
    saveTimeoutRef.current = setTimeout(() => {
      if (configChanged) { // 仅在有未保存更改时执行保存
          saveConfig();
      }
    }, 1000); // 1000ms 延迟
  }, [saveConfig, configChanged]); // 依赖 saveConfig 和 configChanged

  // 处理服务类型变更 - 立即保存服务类型变更
  const handleServiceChange = (service: string) => {
     // 如果有待处理的保存，先取消
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    // 如果当前有未保存的更改，先保存它们
    if (configChanged) {
        saveConfig({ selectedService: service }); // 传递新的 service
    } else {
        saveConfig({ selectedService: service }); // 即使没有其他更改，也要保存服务选择
    }
    setSelectedService(service); // 更新本地状态
  };
  
  // 处理表单输入变化的通用函数
  const handleInputChange = (field: string, value: string) => {
    // 根据字段名更新相应的状态
    switch (field) {
      // GitHub配置
      case 'githubToken': setGithubToken(value); break;
      case 'githubRepo': setGithubRepo(value); break;
      case 'githubOwner': setGithubOwner(value); break;
      
      // AWS S3配置
      case 's3AccessKey': setS3AccessKey(value); break;
      case 's3SecretKey': setS3SecretKey(value); break;
      case 's3Bucket': setS3Bucket(value); break;
      case 's3Region': setS3Region(value); break;
      
      // 腾讯云COS配置
      case 'cosSecretId': setCosSecretId(value); break;
      case 'cosSecretKey': setCosSecretKey(value); break;
      case 'cosBucket': setCosBucket(value); break;
      case 'cosRegion': setCosRegion(value); break;
      
      // 阿里云OSS配置
      case 'ossAccessKey': setOssAccessKey(value); break;
      case 'ossSecretKey': setOssSecretKey(value); break;
      case 'ossBucket': setOssBucket(value); break;
      case 'ossRegion': setOssRegion(value); break;
      
      // 七牛云配置
      case 'qiniuAccessKey': setQiniuAccessKey(value); break;
      case 'qiniuSecretKey': setQiniuSecretKey(value); break;
      case 'qiniuBucket': setQiniuBucket(value); break;
      case 'qiniuDomain': setQiniuDomain(value); break;
      
      // 自定义服务器配置
      case 'customApiUrl': setCustomApiUrl(value); break;
      case 'customApiKey': setCustomApiKey(value); break;
    }
    
    setConfigChanged(true); // 标记有未保存的更改
    debouncedSave(); // 触发 debounced 保存
  };
  
  // 测试连接
  const testConnection = async () => {
    setIsSaving(true);
    setSaveMessage(dict.buttons.testing);
    
    try {
      switch (selectedService) {
        case 'github':
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
          break;
          
        case 'aws':
          // 测试AWS S3连接
          if (!s3AccessKey || !s3SecretKey || !s3Bucket || !s3Region) {
            setSaveMessage(dict.errors.missingAwsFields || '请填写所有AWS S3配置字段');
            return;
          }
          
          try {
            // 创建临时测试路由进行S3验证
            const testEndpoint = '/api/test-s3-connection';
            const testResponse = await fetch(testEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accessKey: s3AccessKey,
                secretKey: s3SecretKey,
                bucket: s3Bucket,
                region: s3Region
              })
            });
            
            const result = await testResponse.json();
            
            if (result.success) {
              setSaveMessage(dict.status.connectionSuccess.replace('{version}', `(${result.message || 'S3连接成功'})`));
            } else {
              setSaveMessage(dict.status.connectionFailed.replace('{message}', result.message || '无法连接到S3服务'));
            }
          } catch (err) {
            // 使用前端方法进行简单验证（不建议在生产环境中使用）
            // 注意：这只是一个简单测试，最好使用服务器端验证
            const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
            const date = timestamp.substring(0, 8);
            
            // 创建一个最小化的请求，只检查存储桶是否存在
            const method = 'HEAD';
            const host = `${s3Bucket}.s3.${s3Region}.amazonaws.com`;
            const endpoint = `https://${host}/`;
            
            const headers = {
              'Host': host,
              'X-Amz-Date': timestamp,
              'X-Amz-Content-Sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // 空内容的SHA256
            };
            
            try {
              const testHeadResponse = await fetch(endpoint, {
                method: method,
                headers: headers,
              });
              
              // 如果响应中包含S3特定的头部，则连接可能成功
              // 注意：这种方法并不能完全确认权限，因为不包含完整的AWS签名
              if (testHeadResponse.headers.get('x-amz-request-id')) {
                setSaveMessage(dict.status.connectionSuccess.replace('{version}', '(基本连接成功，但未验证完整权限)'));
              } else {
                setSaveMessage(dict.status.connectionPartial || '存储桶可访问，但无法确认完整权限。请尝试直接上传测试。');
              }
            } catch (headErr) {
              setSaveMessage(dict.status.connectionFailed.replace('{message}', '无法连接到S3存储桶，请检查区域和存储桶名称'));
            }
          }
          break;
          
        case 'tencent':
          // 测试腾讯云COS连接
          setSaveMessage(dict.status.testNotImplemented || '测试功能未实现，请直接上传测试');
          break;
          
        case 'aliyun':
          // 测试阿里云OSS连接
          setSaveMessage(dict.status.testNotImplemented || '测试功能未实现，请直接上传测试');
          break;
          
        case 'qiniu':
          // 测试七牛云连接
          setSaveMessage(dict.status.testNotImplemented || '测试功能未实现，请直接上传测试');
          break;
          
        case 'custom':
          // 测试自定义API连接
          if (!customApiUrl) {
            setSaveMessage(dict.errors.missingApiUrl);
            return;
          }
          
          // 简单的连接测试 - 实际应用可能需要调整
          const customResponse = await fetch(customApiUrl, {
            method: 'HEAD',
            headers: customApiKey ? { 'Authorization': `Bearer ${customApiKey}` } : {}
          });
          
          if (customResponse.ok) {
            setSaveMessage(dict.status.connectionSuccess.replace('{version}', ''));
          } else {
            setSaveMessage(dict.status.connectionFailed.replace('{message}', customResponse.statusText));
          }
          break;
      }
    } catch (error) {
      console.error('测试连接出错:', error);
      setSaveMessage(dict.status.connectionFailed.replace('{message}', error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };
  
  // 渲染配置表单
  const renderConfigForm = () => {
    switch (selectedService) {
      case 'github':
        return (
          <div className="github-config">
            <h2 className="text-xl font-semibold mb-4">{dict.config.githubConfig}</h2>
            
            <FormGroup label={dict.config.githubToken} htmlFor="githubToken">
              <Input
                id="githubToken"
                type="password"
                value={githubToken}
                onChange={(e) => handleInputChange('githubToken', e.target.value)}
                placeholder={dict.placeholders.githubToken}
              />
              <p className="mt-1 text-xs text-gray-500">
                {dict.config.githubTokenHelp}
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  {dict.config.howToGetToken}
                </a>
              </p>
            </FormGroup>
            
            <FormGroup label={dict.config.githubOwner} htmlFor="githubOwner">
              <Input
                id="githubOwner"
                type="text"
                value={githubOwner}
                onChange={(e) => handleInputChange('githubOwner', e.target.value)}
                placeholder={dict.placeholders.githubOwner}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.githubRepo} htmlFor="githubRepo">
              <Input
                id="githubRepo"
                type="text"
                value={githubRepo}
                onChange={(e) => handleInputChange('githubRepo', e.target.value)}
                placeholder={dict.placeholders.githubRepo}
              />
            </FormGroup>
            
            <div className="path-info p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              <p className="info-text">
                {dict.config.githubPathInfo || '图片将存储在您的仓库中，默认路径为：'}
                <code className="bg-blue-100 px-1 py-0.5 rounded">images/图片名称.png</code>
              </p>
            </div>
            
            {/* 添加GitHub图床指南 */}
            <UploadServiceGuide serviceId="github" />
          </div>
        );
        
      case 'aws':
        return (
          <div className="aws-config">
            <h2 className="text-xl font-semibold mb-4">{dict.config.awsConfig || 'AWS S3 配置'}</h2>
            
            <FormGroup label={dict.config.awsAccessKey || 'Access Key'} htmlFor="s3AccessKey">
              <Input
                id="s3AccessKey"
                type="text"
                value={s3AccessKey}
                onChange={(e) => handleInputChange('s3AccessKey', e.target.value)}
                placeholder={dict.placeholders.awsAccessKey || '输入您的 AWS Access Key'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.awsSecretKey || 'Secret Key'} htmlFor="s3SecretKey">
              <Input
                id="s3SecretKey"
                type="password"
                value={s3SecretKey}
                onChange={(e) => handleInputChange('s3SecretKey', e.target.value)}
                placeholder={dict.placeholders.awsSecretKey || '输入您的 AWS Secret Key'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.awsBucket || 'Bucket'} htmlFor="s3Bucket">
              <Input
                id="s3Bucket"
                type="text"
                value={s3Bucket}
                onChange={(e) => handleInputChange('s3Bucket', e.target.value)}
                placeholder={dict.placeholders.awsBucket || '输入您的 S3 Bucket 名称'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.awsRegion || 'Region'} htmlFor="s3Region">
              <Input
                id="s3Region"
                type="text"
                value={s3Region}
                onChange={(e) => handleInputChange('s3Region', e.target.value)}
                placeholder={dict.placeholders.awsRegion || '输入 AWS 区域代码，如 us-east-1'}
              />
            </FormGroup>
            
            {/* S3测试连接提示 */}
            <div className="test-connection-info mt-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
              <h3 className="font-medium mb-2">测试连接说明</h3>
              <p>完成以上配置后，点击底部的"测试连接"按钮来验证您的AWS S3凭证是否正确配置。测试将检查：</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                <li>您的Access Key和Secret Key是否有效</li>
                <li>存储桶是否存在且可访问</li>
                <li>您是否拥有必要的权限</li>
              </ul>
              <p className="mt-2">如果测试成功，表示您可以正常使用S3上传图片。如果测试失败，请检查错误信息并相应调整配置。</p>
            </div>
            
            {/* CORS配置提示 */}
            <div className="cors-info mt-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <h3 className="font-medium mb-2">重要：CORS配置</h3>
              <p>如果您遇到以下错误：</p>
              <div className="bg-gray-100 p-2 my-2 rounded text-xs overflow-x-auto">
                Access to fetch at 'https://your-bucket.s3.region.amazonaws.com/...' has been blocked by CORS policy
              </div>
              <p>您需要为S3存储桶配置CORS策略：</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                <li>登录AWS管理控制台，进入S3服务</li>
                <li>选择您的存储桶，点击"权限"选项卡</li>
                <li>找到"跨源资源共享(CORS)"部分，点击"编辑"</li>
                <li>添加以下JSON配置：</li>
              </ol>
              <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-x-auto">
{`[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://您的网站域名.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]`}
              </pre>
              <p className="mt-2">作为临时解决方案，您也可以使用我们提供的代理服务，将图片URL从：</p>
              <div className="bg-gray-100 p-2 my-2 rounded text-xs overflow-x-auto">
                https://your-bucket.s3.region.amazonaws.com/image.jpg
              </div>
              <p>修改为：</p>
              <div className="bg-gray-100 p-2 my-2 rounded text-xs overflow-x-auto">
                /api/s3-proxy?url=https://your-bucket.s3.region.amazonaws.com/image.jpg
              </div>
            </div>
            
            {/* 添加AWS S3指南 */}
            <UploadServiceGuide serviceId="aws" />
          </div>
        );
        
      case 'tencent':
        return (
          <div className="tencent-config">
            <h2 className="text-xl font-semibold mb-4">{dict.config.tencentConfig || '腾讯云 COS 配置'}</h2>
            
            <FormGroup label={dict.config.tencentSecretId || 'SecretId'} htmlFor="cosSecretId">
              <Input
                id="cosSecretId"
                type="text"
                value={cosSecretId}
                onChange={(e) => handleInputChange('cosSecretId', e.target.value)}
                placeholder={dict.placeholders.tencentSecretId || '输入您的腾讯云 SecretId'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.tencentSecretKey || 'SecretKey'} htmlFor="cosSecretKey">
              <Input
                id="cosSecretKey"
                type="password"
                value={cosSecretKey}
                onChange={(e) => handleInputChange('cosSecretKey', e.target.value)}
                placeholder={dict.placeholders.tencentSecretKey || '输入您的腾讯云 SecretKey'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.tencentBucket || 'Bucket'} htmlFor="cosBucket">
              <Input
                id="cosBucket"
                type="text"
                value={cosBucket}
                onChange={(e) => handleInputChange('cosBucket', e.target.value)}
                placeholder={dict.placeholders.tencentBucket || '输入您的 COS Bucket 名称'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.tencentRegion || 'Region'} htmlFor="cosRegion">
              <Input
                id="cosRegion"
                type="text"
                value={cosRegion}
                onChange={(e) => handleInputChange('cosRegion', e.target.value)}
                placeholder={dict.placeholders.tencentRegion || '输入 COS 区域代码，如 ap-beijing'}
              />
            </FormGroup>
            
            {/* 添加腾讯云COS指南 */}
            <UploadServiceGuide serviceId="tencent" />
          </div>
        );
        
      case 'aliyun':
        return (
          <div className="aliyun-config">
            <h2 className="text-xl font-semibold mb-4">{dict.config.aliyunConfig || '阿里云 OSS 配置'}</h2>
            
            <FormGroup label={dict.config.aliyunAccessKey || 'AccessKey'} htmlFor="ossAccessKey">
              <Input
                id="ossAccessKey"
                type="text"
                value={ossAccessKey}
                onChange={(e) => handleInputChange('ossAccessKey', e.target.value)}
                placeholder={dict.placeholders.aliyunAccessKey || '输入您的阿里云 AccessKey'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.aliyunSecretKey || 'SecretKey'} htmlFor="ossSecretKey">
              <Input
                id="ossSecretKey"
                type="password"
                value={ossSecretKey}
                onChange={(e) => handleInputChange('ossSecretKey', e.target.value)}
                placeholder={dict.placeholders.aliyunSecretKey || '输入您的阿里云 SecretKey'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.aliyunBucket || 'Bucket'} htmlFor="ossBucket">
              <Input
                id="ossBucket"
                type="text"
                value={ossBucket}
                onChange={(e) => handleInputChange('ossBucket', e.target.value)}
                placeholder={dict.placeholders.aliyunBucket || '输入您的 OSS Bucket 名称'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.aliyunRegion || 'Region'} htmlFor="ossRegion">
              <Input
                id="ossRegion"
                type="text"
                value={ossRegion}
                onChange={(e) => handleInputChange('ossRegion', e.target.value)}
                placeholder={dict.placeholders.aliyunRegion || '输入 OSS 区域代码，如 oss-cn-hangzhou'}
              />
            </FormGroup>
            
            {/* 添加阿里云OSS指南 */}
            <UploadServiceGuide serviceId="aliyun" />
          </div>
        );
        
      case 'qiniu':
        return (
          <div className="qiniu-config">
            <h2 className="text-xl font-semibold mb-4">{dict.config.qiniuConfig || '七牛云配置'}</h2>
            
            <FormGroup label={dict.config.qiniuAccessKey || 'AccessKey'} htmlFor="qiniuAccessKey">
              <Input
                id="qiniuAccessKey"
                type="text"
                value={qiniuAccessKey}
                onChange={(e) => handleInputChange('qiniuAccessKey', e.target.value)}
                placeholder={dict.placeholders.qiniuAccessKey || '输入您的七牛云 AccessKey'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.qiniuSecretKey || 'SecretKey'} htmlFor="qiniuSecretKey">
              <Input
                id="qiniuSecretKey"
                type="password"
                value={qiniuSecretKey}
                onChange={(e) => handleInputChange('qiniuSecretKey', e.target.value)}
                placeholder={dict.placeholders.qiniuSecretKey || '输入您的七牛云 SecretKey'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.qiniuBucket || 'Bucket'} htmlFor="qiniuBucket">
              <Input
                id="qiniuBucket"
                type="text"
                value={qiniuBucket}
                onChange={(e) => handleInputChange('qiniuBucket', e.target.value)}
                placeholder={dict.placeholders.qiniuBucket || '输入您的七牛云存储空间名称'}
              />
            </FormGroup>
            
            <FormGroup label={dict.config.qiniuDomain || '域名'} htmlFor="qiniuDomain">
              <Input
                id="qiniuDomain"
                type="text"
                value={qiniuDomain}
                onChange={(e) => handleInputChange('qiniuDomain', e.target.value)}
                placeholder={dict.placeholders.qiniuDomain || '输入您的七牛云空间绑定的域名，包含http(s)://'}
              />
            </FormGroup>
            
            {/* 添加七牛云指南 */}
            <UploadServiceGuide serviceId="qiniu" />
          </div>
        );
        
      case 'custom':
        return (
          <div className="custom-config">
            <h2 className="text-xl font-semibold mb-4">{dict.config.customConfig || '自定义服务器配置'}</h2>
            
            <FormGroup 
              label={dict.config.customApiUrl || 'API地址'} 
              htmlFor="customApiUrl"
              helpText={dict.config.customApiUrlHelp || '您自定义的图片上传API地址'}
            >
              <Input
                id="customApiUrl"
                type="text"
                value={customApiUrl}
                onChange={(e) => handleInputChange('customApiUrl', e.target.value)}
                placeholder={dict.placeholders.customApiUrl || '输入您的API地址，如 https://api.example.com/upload'}
              />
            </FormGroup>
            
            <FormGroup 
              label={dict.config.customApiKey || 'API密钥'} 
              htmlFor="customApiKey"
              helpText={dict.config.customApiKeyHelp || '如果您的API需要认证，请提供密钥（可选）'}
            >
              <Input
                id="customApiKey"
                type="password"
                value={customApiKey}
                onChange={(e) => handleInputChange('customApiKey', e.target.value)}
                placeholder={dict.placeholders.customApiKey || '可选：输入API认证密钥'}
              />
            </FormGroup>
            
            {/* 添加自定义服务器指南 */}
            <UploadServiceGuide serviceId="custom" />
          </div>
        );
        
      default:
        return (
          <div className="empty-config p-4 text-gray-500">
            <p>{dict.config.selectService || '请选择图床服务'}</p>
            
            {/* 添加默认指南 */}
            <UploadServiceGuide serviceId="default" />
          </div>
        );
    }
  };
  
  // Effect for handling unmount and saving pending changes
  useEffect(() => {
    // The return function is the cleanup function
    return () => {
      // Clear any pending debounced save timer
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Check if there are unsaved changes using the ref's current value
      if (configChangedRef.current) {
        console.log('Component unmounting with unsaved changes. Saving...'); // For debugging
        saveConfigRef.current(); // Call the latest save function via ref
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  return (
    <main className="config-page p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">{dict.config.title}</h1>
      
      {/* Use Flexbox/Grid for layout */}
      <div className="flex flex-col md:flex-row gap-6 bg-white shadow rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div className="config-sidebar p-4 md:w-1/3 lg:w-1/4 border-b md:border-b-0 md:border-r border-gray-200">
          <h2 className="text-lg font-semibold mb-4">{dict.config.serviceSelector || '选择图床服务'}</h2>
          {/* Service list - needs Tailwind styling */}
          <ul className="service-list space-y-1">
            {imageBedServices.map(service => (
              <li 
                key={service.id}
                className={`service-item p-2 rounded-md flex items-center gap-3 cursor-pointer transition-colors ${selectedService === service.id ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100'}`}
                onClick={() => handleServiceChange(service.id)}
              >
                <div className="service-icon flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {service.icon}
                </div>
                <div className="service-info overflow-hidden">
                  <div className="service-name truncate">{service.name}</div>
                  <div className="service-description text-xs text-gray-500 truncate">{service.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Main content area */}
        <div className="config-content p-4 md:p-6 flex-1">
          {/* Render the form for the selected service */}
          <div key={selectedService}>
            {renderConfigForm()}
          </div>
          
          {/* Status messages - needs Tailwind styling */}
          {saveMessage && (
            <div className={`save-message mt-4 p-2 rounded text-sm ${saveMessage.includes('✓') || saveMessage.includes(dict.status.configSaved) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {saveMessage}
            </div>
          )}
          
          {configChanged && !isSaving && (
            <div className="config-changed-indicator mt-2 text-sm text-yellow-600">
              {dict.status.configChanged}
            </div>
          )}
          
          {/* 修改自动保存提示，使其在 configChanged 为 true 且计时器存在时显示 */}
           {configChanged && saveTimeoutRef.current && !isSaving && (
             <div className="config-changed-indicator saving-indicator mt-2 text-sm text-gray-500 animate-pulse">
               {dict.status.pendingSave || '待保存...'}
             </div>
           )}
          
          {/* Action Button */}
          <div className="config-actions mt-6 border-t pt-4">
            <Button
              variant="success"
              onClick={testConnection}
              disabled={isSaving}
            >
              {dict.buttons.testConnection}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
} 