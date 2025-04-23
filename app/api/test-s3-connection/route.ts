import { NextResponse } from 'next/server';

// 这个路由用于测试AWS S3连接
export async function POST(request: Request) {
  try {
    const { accessKey, secretKey, bucket, region } = await request.json();

    // 验证必要参数
    if (!accessKey || !secretKey || !bucket || !region) {
      return NextResponse.json({
        success: false,
        message: '请提供所有必要的AWS S3凭证信息'
      }, { status: 400 });
    }

    // 尝试使用AWS SDK验证凭证
    // 注意：为了在Next.js应用中使用AWS SDK，您需要安装：
    // npm install @aws-sdk/client-s3
    // 下面的代码假设已安装了这个依赖

    try {
      // 动态导入AWS SDK，避免在服务器端渲染时出现问题
      const { S3Client, ListObjectsCommand } = await import('@aws-sdk/client-s3');
      
      // 创建S3客户端
      const s3Client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey
        }
      });
      
      // 尝试列出最多1个对象来验证连接
      const command = new ListObjectsCommand({
        Bucket: bucket,
        MaxKeys: 1
      });
      
      // 执行命令
      const response = await s3Client.send(command);
      
      // 如果没有抛出异常，连接成功
      return NextResponse.json({
        success: true,
        message: '成功连接到S3存储桶',
        // 可选：返回基本信息
        bucketInfo: {
          name: bucket,
          region: region,
          objectCount: response.Contents?.length || 0
        }
      });
    } catch (sdkError: any) {
      console.error('AWS SDK错误:', sdkError);
      
      // 解析AWS错误
      let errorMessage = '连接S3失败';
      if (sdkError.name === 'AccessDenied') {
        errorMessage = '访问被拒绝，请检查您的凭证和权限';
      } else if (sdkError.name === 'NoSuchBucket') {
        errorMessage = '存储桶不存在，请检查存储桶名称';
      } else if (sdkError.name === 'InvalidAccessKeyId') {
        errorMessage = '无效的Access Key ID';
      } else if (sdkError.name === 'SignatureDoesNotMatch') {
        errorMessage = '签名不匹配，请检查您的Secret Key';
      } else if (sdkError.message) {
        errorMessage = sdkError.message;
      }
      
      // 尝试备用方法
      return await fallbackS3Test(bucket, region, errorMessage);
    }
  } catch (error) {
    console.error('处理请求错误:', error);
    return NextResponse.json({
      success: false,
      message: '请求处理失败'
    }, { status: 500 });
  }
}

// 备用测试方法 - 当AWS SDK不可用或失败时使用
async function fallbackS3Test(bucket: string, region: string, errorMessage: string) {
  try {
    // 尝试基本HTTP请求来测试存储桶是否至少存在
    const url = `https://${bucket}.s3.${region}.amazonaws.com/`;
    
    const response = await fetch(url, {
      method: 'HEAD',
    });
    
    // 检查响应
    if (response.status === 200 || response.status === 403) {
      // 存储桶存在，但可能无权访问
      return NextResponse.json({
        success: false,
        message: `${errorMessage}。存储桶似乎存在，但SDK验证失败。建议检查权限设置。`,
        sdkError: errorMessage
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `${errorMessage}。存储桶可能不存在或区域不正确。`,
        status: response.status
      });
    }
  } catch (fallbackError) {
    return NextResponse.json({
      success: false,
      message: `${errorMessage}。无法连接到存储桶。`,
      detail: fallbackError instanceof Error ? fallbackError.message : '未知错误'
    });
  }
} 