import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// 确保上传目录存在
const uploadDir = join(process.cwd(), 'public', 'uploads');

// 生成唯一文件名
const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomStr}.${extension}`;
};

export async function POST(request: NextRequest) {
  try {
    // 确保上传目录存在
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // 解析请求中的表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const path = formData.get('path') as string | null;

    // 验证文件是否存在
    if (!file) {
      return NextResponse.json(
        { error: '未发现文件' },
        { status: 400 }
      );
    }

    // 验证文件类型（可选）
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '仅支持图片文件' },
        { status: 400 }
      );
    }

    // 处理路径前缀
    let filePath = uploadDir;
    if (path) {
      filePath = join(uploadDir, path);
      if (!existsSync(filePath)) {
        mkdirSync(filePath, { recursive: true });
      }
    }

    // 生成唯一文件名或使用原始文件名
    const uniqueFilename = generateUniqueFilename(file.name);
    const fullPath = join(filePath, uniqueFilename);
    
    // 将文件保存到服务器
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(fullPath, buffer);

    // 计算相对于public的路径，用于URL
    const relativePath = path ? `uploads/${path}/${uniqueFilename}` : `uploads/${uniqueFilename}`;
    
    // 返回文件URL
    const fileUrl = `/api/image/${relativePath}`;
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      path: relativePath
    });
  } catch (error) {
    console.error('上传文件错误:', error);
    return NextResponse.json(
      { error: '上传文件失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 设置请求体大小限制（可选）
export const config = {
  api: {
    bodyParser: false, // Next.js不会解析请求体，我们自己处理
  },
}; 