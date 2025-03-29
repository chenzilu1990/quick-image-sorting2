/**
 * 图片上传服务
 * 支持上传到GitHub和自定义服务器
 */

// 从localStorage获取配置
const getConfig = () => {
  try {
    const savedConfig = localStorage.getItem('imageUploaderConfig');
    if (!savedConfig) {
      throw new Error('未找到上传配置');
    }
    return JSON.parse(savedConfig);
  } catch (error) {
    console.error('获取上传配置出错:', error);
    throw new Error('获取上传配置出错，请先配置上传服务');
  }
};

/**
 * 生成唯一文件名
 * @param {string} originalName 原始文件名
 * @returns {string} 唯一文件名
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  
  // 提取文件扩展名
  const lastDotIndex = originalName.lastIndexOf('.');
  let ext = '';
  if (lastDotIndex !== -1) {
    ext = originalName.substring(lastDotIndex);
  }
  
  // 生成新文件名: 原名-时间戳-随机字符.扩展名
  return `${originalName.substring(0, lastDotIndex)}-${timestamp}-${randomString}${ext}`;
};

/**
 * 上传图片到GitHub
 * @param {File} file 要上传的文件
 * @param {string} displayName 显示名称
 * @param {string} groupPrefix 图片组前缀，用作存储路径
 * @returns {Promise<{url: string, success: boolean, message: string}>} 上传结果
 */
const uploadToGitHub = async (file, displayName, groupPrefix) => {
  try {
    const config = getConfig();
    
    if (!config.github || !config.github.token || !config.github.repo || !config.github.owner) {
      throw new Error('GitHub配置不完整，请先完成配置');
    }
    
    const { token, repo, owner } = config.github;
    
    // 使用groupPrefix作为存储路径
    const path = groupPrefix || '';
    
    // 读取文件内容
    const base64Content = await fileToBase64(file);
    if (!base64Content) {
      throw new Error('文件读取失败');
    }
    
    // 使用重命名后的文件名，不再生成唯一文件名
    const filename = displayName || file.name;
    
    // 构建文件路径，使用图片组前缀作为目录
    const filePath = path ? `${path}/${filename}` : filename;
    
    // 创建提交信息
    const commitMessage = `Upload image: ${filename} to ${path || 'root'}`;
    
    // 准备请求数据
    const requestData = {
      message: commitMessage,
      content: base64Content.split(',')[1], // 移除Data URL前缀
      branch: 'main' // 改为master分支，更常见
    };
    
    // 发送创建文件的API请求
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(requestData)
      }
    );
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`GitHub API错误: ${responseData.message || response.statusText}`);
    }
    
    // 返回图片URL
    return {
      success: true,
      url: responseData.content.download_url,
      message: '上传成功',
      data: responseData
    };
    
  } catch (error) {
    console.error('上传到GitHub失败:', error);
    return {
      success: false,
      url: '',
      message: error.message || '上传失败'
    };
  }
};

/**
 * 上传图片到自定义服务器
 * @param {File} file 要上传的文件
 * @param {string} displayName 显示名称
 * @param {string} groupPrefix 图片组前缀，用于可能的路径处理
 * @returns {Promise<{url: string, success: boolean, message: string}>} 上传结果
 */
const uploadToCustomServer = async (file, displayName, groupPrefix) => {
  try {
    const config = getConfig();
    
    if (!config.customServer || !config.customServer.apiUrl) {
      throw new Error('自定义服务器配置不完整，请先完成配置');
    }
    
    const { apiUrl, apiKey } = config.customServer;
    
    // 创建FormData对象
    const formData = new FormData();
    
    // 使用重命名后的文件名，而不是生成新的唯一文件名
    if (displayName) {
      // 直接使用displayName作为文件名
      const renamedFile = new File([file], displayName, { type: file.type });
      formData.append('file', renamedFile);
    } else {
      formData.append('file', file);
    }
    
    // 添加路径信息，如果自定义服务器支持此参数
    if (groupPrefix) {
      formData.append('path', groupPrefix);
    }
    
    // 设置请求头
    const headers = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    // 发送上传请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (!responseData.url) {
      throw new Error('服务器未返回图片URL');
    }
    
    return {
      success: true,
      url: responseData.url,
      message: '上传成功',
      data: responseData
    };
    
  } catch (error) {
    console.error('上传到自定义服务器失败:', error);
    return {
      success: false,
      url: '',
      message: error.message || '上传失败'
    };
  }
};

/**
 * 将文件转换为Base64
 * @param {File} file 文件对象
 * @returns {Promise<string>} Base64字符串
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * 上传批量图片
 * @param {Array} images 图片数组
 * @returns {Promise<Array>} 上传结果数组
 */
const uploadBatch = async (images) => {
  if (!images || images.length === 0) {
    return [];
  }
  
  const config = getConfig();
  const uploadService = config.selectedService === 'github' ? uploadToGitHub : uploadToCustomServer;
  
  // 获取图片组的前缀作为存储路径
  const groupPrefix = images[0]?.prefix || '';
  
  const results = [];
  
  for (const image of images) {
    try {
      // 从preview URL获取文件内容
      const response = await fetch(image.preview);
      const blob = await response.blob();
      
      // 创建File对象
      const file = new File([blob], image.file.name, { type: blob.type });
      
      // 上传图片，传入组前缀作为存储路径
      const result = await uploadService(file, image.file.displayName || image.file.name, groupPrefix);
      results.push({
        ...result,
        originalImage: image
      });
    } catch (error) {
      console.error(`上传图片 ${image.file.name} 失败:`, error);
      results.push({
        success: false,
        url: '',
        message: error.message || '上传失败',
        originalImage: image
      });
    }
  }
  
  return results;
};

export default {
  uploadToGitHub,
  uploadToCustomServer,
  uploadBatch,
  getConfig
}; 