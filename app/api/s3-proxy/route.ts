import { NextResponse } from 'next/server';

// 这个API路由用于代理S3请求，绕过CORS限制
export async function GET(request: Request) {
  // 从请求中获取目标URL参数
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  // 验证URL参数
  if (!url) {
    return NextResponse.json({ error: '未提供URL参数' }, { status: 400 });
  }
  
  // 验证URL是否为有效的S3 URL（安全检查）
  if (!url.includes('.s3.') || !url.startsWith('https://')) {
    return NextResponse.json({ error: '无效的S3 URL' }, { status: 400 });
  }
  
  try {
    // 请求S3资源
    const response = await fetch(url);
    
    // 如果资源不存在或无法访问
    if (!response.ok) {
      return NextResponse.json(
        { error: `无法获取资源: ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    // 获取原始资源的内容类型
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // 读取响应数据
    const arrayBuffer = await response.arrayBuffer();
    
    // 创建新的响应对象
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('代理S3请求失败:', error);
    return NextResponse.json(
      { error: '代理请求失败', message: error instanceof Error ? error.message : '未知错误' }, 
      { status: 500 }
    );
  }
} 