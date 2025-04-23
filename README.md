# 图片快速排序工具

一个基于Next.js的图片快速排序工具，支持拖拽排序、批量重命名和导出功能。

## 功能特点

- 🖼️ 支持拖拽上传图片
- 🔍 支持图片多选
- 🏷️ 支持批量重命名（自动添加MAIN、PT01-PT08、SWITCH后缀）
- 📦 支持批量导出为ZIP文件
- 📋 支持导出排序结果

## 使用方法

1. **上传图片**
   - 将图片拖放到页面任意位置
   - 或双击页面任意位置选择图片

2. **排序图片**
   - 点击图片可以多选

3. **重命名图片**
   - 选择要重命名的图片
   - 在顶部输入框中输入前缀
   - 点击"应用前缀"按钮
   - 系统会自动为选中的图片添加MAIN、PT01-PT08、SWITCH后缀

4. **导出功能**
   - 下载选中图片：选择图片后点击"下载选中图片（ZIP）"
   - 下载重命名图片：在重命名预览区可以下载单组或所有重命名图片
   - 下载排序结果：点击"下载排序结果"获取图片顺序列表

## 技术栈

- Next.js
- React
- CSS Modules
- react-beautiful-dnd
- JSZip

## 开发环境设置

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
```

3. 运行开发服务器
```bash
npm run dev
```

4. 打开浏览器访问
```
http://localhost:3000
```

## 注意事项

- 支持常见图片格式（jpg、png、gif等）
- 建议单次上传图片数量不要过多，以保证最佳性能
- 重命名时会自动保留原文件扩展名
- 所有预览URL会在组件卸载时自动清理

## 许可证

MIT License

# AWS S3 配置和测试

## 功能说明

在本次更新中，我们为图片上传服务添加了 AWS S3 连接测试功能，帮助用户验证他们的 S3 配置是否正确。

### 主要特性

1. **S3 配置表单**：用户可以输入 AWS S3 的必要配置信息
   - Access Key
   - Secret Key
   - Bucket 名称
   - Region 区域

2. **连接测试功能**：点击"测试连接"按钮，系统会验证：
   - 凭证是否有效
   - 存储桶是否存在且可访问
   - 用户权限是否足够

3. **详细的错误提示**：当测试失败时，系统会提供具体的错误原因，帮助用户排查问题

## 技术实现

1. 前端配置表单位于 `app/[lang]/config/config-client.tsx`
2. 后端验证API位于 `app/api/test-s3-connection/route.ts`
3. 使用 AWS SDK 进行凭证验证 (`@aws-sdk/client-s3`)
4. 提供备用验证方法，以防 SDK 不可用或出错

## 使用说明

1. 在配置页面选择 "AWS S3" 服务
2. 填写必要的配置信息
3. 点击底部的"测试连接"按钮
4. 系统会显示测试结果和相关提示信息

## 未来改进

1. 添加更多S3配置选项（如存储类型、自定义域名等）
2. 实现上传测试功能，验证完整的上传流程
3. 添加权限检查，确保配置的凭证具有必要的S3操作权限

# AWS S3 CORS配置解决方案

## 问题描述

在使用AWS S3存储图片时，您可能会遇到以下CORS错误：

```
Access to fetch at 'https://your-bucket.s3.region.amazonaws.com/...' 
has been blocked by CORS policy: Response to preflight request doesn't pass 
access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

这是因为S3存储桶默认不允许来自其他域的请求访问资源。

## 解决方案

### 方案1：配置S3存储桶CORS（推荐）

1. 登录AWS管理控制台，进入S3服务
2. 选择您的存储桶，点击"权限"选项卡
3. 找到"跨源资源共享(CORS)"部分，点击"编辑"
4. 添加以下JSON配置：

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://您的网站域名.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

5. 点击"保存更改"

### 方案2：使用内置的代理服务（临时解决方案）

我们在应用中提供了一个代理API，可以绕过CORS限制：

1. 使用我们的 `S3Image` 组件替代普通 `Image` 组件：

```tsx
import S3Image from '@/components/ui/S3Image';

// 原始代码
<Image src="https://your-bucket.s3.region.amazonaws.com/image.jpg" alt="图片" width={200} height={200} />

// 替换为
<S3Image src="https://your-bucket.s3.region.amazonaws.com/image.jpg" alt="图片" width={200} height={200} />
```

2. 对于fetch请求，可以使用我们的工具函数：

```tsx
import { corsProofFetch } from '@/utils/s3-helper';

// 原始代码
const response = await fetch("https://your-bucket.s3.region.amazonaws.com/image.jpg");

// 替换为
const response = await corsProofFetch("https://your-bucket.s3.region.amazonaws.com/image.jpg");
```

3. 手动转换URL：

```tsx
import { getProxiedS3Url } from '@/utils/s3-helper';

const imageUrl = getProxiedS3Url("https://your-bucket.s3.region.amazonaws.com/image.jpg");
// 结果: "/api/s3-proxy?url=https%3A%2F%2Fyour-bucket.s3.region.amazonaws.com%2Fimage.jpg"
```

## 注意事项

- 方案1是推荐的长期解决方案，可以提供更好的性能
- 方案2适用于临时解决或无法修改S3配置的情况
- 代理方案会增加服务器负载，不适合大规模生产环境使用 