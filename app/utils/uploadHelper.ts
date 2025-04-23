/**
 * 图片上传辅助函数
 * 
 * 提供简单的方法来上传图片并获取URL
 */

interface UploadOptions {
  path?: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  success: boolean;
  url: string;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  path?: string;
  error?: string;
}

/**
 * 上传单个图片文件并返回链接
 * 
 * @param file 要上传的图片文件
 * @param options 上传选项
 * @returns 上传结果，包含链接
 */
export async function uploadImage(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    if (!file || !file.type.startsWith('image/')) {
      return {
        success: false,
        url: '',
        error: '无效的图片文件'
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (options.path) {
      formData.append('path', options.path);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        url: '',
        error: errorData.error || '上传失败'
      };
    }

    const result = await response.json();
    
    return {
      success: true,
      url: result.url,
      filename: result.filename,
      originalName: result.originalName,
      size: result.size,
      type: result.type,
      path: result.path
    };
  } catch (error) {
    return {
      success: false,
      url: '',
      error: (error as Error).message || '上传过程中发生错误'
    };
  }
}

/**
 * 将base64图片数据转换为文件并上传
 * 
 * @param base64Data base64格式的图片数据
 * @param filename 文件名
 * @param options 上传选项
 * @returns 上传结果
 */
export async function uploadBase64Image(
  base64Data: string,
  filename: string = 'image.png',
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // 从base64字符串创建Blob
    const fetchResponse = await fetch(base64Data);
    if (!fetchResponse.ok) {
      throw new Error('无法处理Base64数据');
    }
    
    const blob = await fetchResponse.blob();
    
    // 创建File对象
    const file = new File([blob], filename, { type: blob.type });
    
    // 使用uploadImage函数上传
    return await uploadImage(file, options);
  } catch (error) {
    return {
      success: false,
      url: '',
      error: (error as Error).message || 'Base64图片处理失败'
    };
  }
}

/**
 * 将图片URL转换为文件并上传
 * 
 * @param imageUrl 图片URL
 * @param filename 文件名
 * @param options 上传选项
 * @returns 上传结果
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  filename: string = 'image.png',
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // 从URL获取图片内容
    const fetchResponse = await fetch(imageUrl);
    if (!fetchResponse.ok) {
      throw new Error('获取图片失败');
    }
    
    const blob = await fetchResponse.blob();
    
    // 创建File对象
    const file = new File([blob], filename, { type: blob.type });
    
    // 使用uploadImage函数上传
    return await uploadImage(file, options);
  } catch (error) {
    return {
      success: false,
      url: '',
      error: (error as Error).message || 'URL图片处理失败'
    };
  }
} 