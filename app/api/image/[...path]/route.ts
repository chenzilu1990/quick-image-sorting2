import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

// 图片MIME类型映射
const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 获取路径参数
    const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
    
    // 构建文件路径
    const filePath = join(process.cwd(), 'public', path);
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }
    
    // 读取文件
    const file = await readFile(filePath);
    
    // 确定文件MIME类型
    const extension = path.split('.').pop()?.toLowerCase() || '';
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    
    // 返回文件及适当的内容类型
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 缓存一年
      },
    });
  } catch (error) {
    console.error('获取图片错误:', error);
    return NextResponse.json(
      { error: '获取图片失败', details: (error as Error).message },
      { status: 500 }
    );
  }
} 