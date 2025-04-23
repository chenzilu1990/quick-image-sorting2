/**
 * S3帮助工具 - 处理S3 URL和CORS问题
 */

// 检查URL是否为S3 URL
export function isS3Url(url: string): boolean {
  return url.includes('.s3.') && url.startsWith('https://');
}

// 检测当前环境是否支持使用代理
// 在服务器端渲染时，我们不应该修改URL
export function shouldUseProxy(): boolean {
  return typeof window !== 'undefined';
}

/**
 * 根据需要将S3 URL转换为代理URL
 * @param url 原始S3 URL
 * @param forceProxy 是否强制使用代理（即使不是S3 URL）
 * @returns 处理后的URL
 */
export function getProxiedS3Url(url: string, forceProxy: boolean = false): string {
  // 检查是否为有效URL
  if (!url) return url;
  
  // 检查是否为S3 URL
  if (!forceProxy && !isS3Url(url)) return url;
  
  // 检查是否可以使用代理
  if (!shouldUseProxy()) return url;
  
  // 构建代理URL
  return `/api/s3-proxy?url=${encodeURIComponent(url)}`;
}

/**
 * 创建支持CORS的图片组件src属性
 * 如果是S3 URL，则使用代理URL，否则返回原始URL
 * @param src 原始图片URL
 * @returns 处理后的URL
 */
export function createCorsProofImageUrl(src: string): string {
  return getProxiedS3Url(src);
}

/**
 * 使用此函数包装fetch请求以处理S3 CORS问题
 * @param url 请求URL
 * @param options fetch选项
 * @returns fetch响应
 */
export async function corsProofFetch(url: string, options?: RequestInit): Promise<Response> {
  const processedUrl = getProxiedS3Url(url);
  return fetch(processedUrl, options);
} 