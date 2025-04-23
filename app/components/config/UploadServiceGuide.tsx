'use client';

import React from 'react';
import { useDictionary } from '@/components/hooks/client-dictionary';

interface UploadServiceGuideProps {
  serviceId: string;
}

const UploadServiceGuide: React.FC<UploadServiceGuideProps> = ({ serviceId }) => {
  const dict = useDictionary();

  const renderGithubGuide = () => (
    <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
      <h3 className="font-semibold text-blue-800 mb-2">GitHub 图床配置详细说明</h3>
      <div className="space-y-3">
        <p className="text-gray-700">
          GitHub 图床使用 GitHub 仓库存储图片，可以免费使用，但有一定的限制。适合小型项目和个人使用。
        </p>
        
        <div className="bg-white p-3 rounded border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-1">配置步骤：</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <span className="font-medium">创建 GitHub 令牌：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>访问 <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub 令牌设置页面</a></li>
                <li>点击 "Generate new token" (Classic)</li>
                <li>给令牌起一个描述性名称（如 "图片上传"）</li>
                <li>选择 "repo" 权限范围（这允许访问您的仓库）</li>
                <li>点击底部的 "Generate token" 按钮</li>
                <li>复制生成的令牌（注意：此令牌只显示一次！）</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">准备仓库：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>您可以使用现有仓库或创建一个新的仓库用于存储图片</li>
                <li>如需创建新仓库，访问 <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub 创建仓库页面</a></li>
                <li>推荐将仓库设为公开，这样可以直接访问图片链接</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">填写配置信息：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>填入您刚才生成的 Personal Access Token</li>
                <li>填入仓库所有者（您的 GitHub 用户名）</li>
                <li>填入仓库名称（不包含用户名，如 "my-images"）</li>
              </ol>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">注意事项：</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>GitHub 有存储和带宽限制，不适合大量图片或高流量网站</li>
            <li>令牌具有访问您仓库的权限，请妥善保管</li>
            <li>图片会按照图片组的前缀自动组织成文件夹</li>
            <li>生成的图片URL格式为：<code className="bg-gray-100 px-1 py-0.5 rounded">https://raw.githubusercontent.com/用户名/仓库名/main/图片路径</code></li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAwsGuide = () => (
    <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
      <h3 className="font-semibold text-blue-800 mb-2">AWS S3 配置详细说明</h3>
      <div className="space-y-3">
        <p className="text-gray-700">
          Amazon S3 是一种可靠的对象存储服务，适合存储和分发图片。它提供高可用性、安全性和性能。
        </p>
        
        <div className="bg-white p-3 rounded border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-1">配置步骤：</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <span className="font-medium">创建 AWS 账户：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>如果您还没有 AWS 账户，请访问 <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">AWS 官网</a> 注册</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">创建 S3 存储桶：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>登录 AWS 管理控制台</li>
                <li>搜索并进入 S3 服务</li>
                <li>点击 "创建存储桶"</li>
                <li>选择一个唯一的存储桶名称和地区</li>
                <li>如果需要公开访问图片，请取消勾选 "阻止所有公共访问"</li>
                <li>其他设置保持默认，点击 "创建存储桶"</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">配置存储桶权限：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>如需公开访问图片，进入存储桶 → 权限 → 存储桶策略</li>
                <li>添加类似以下的策略（替换 YOUR-BUCKET-NAME）：</li>
                <li>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}`}
                  </pre>
                </li>
              </ol>
            </li>
            <li>
              <span className="font-medium">创建 IAM 访问密钥：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>进入 IAM 服务，创建一个专用用户或使用现有用户</li>
                <li>为该用户添加 S3 访问权限策略</li>
                <li>创建访问密钥（Access Key 和 Secret Key）</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">填写配置信息：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>Access Key: 您创建的 IAM 访问密钥</li>
                <li>Secret Key: 对应的密钥</li>
                <li>Bucket: 您创建的存储桶名称</li>
                <li>Region: 存储桶所在的区域（如 us-east-1）</li>
              </ol>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">注意事项：</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>AWS S3 是付费服务，会根据存储量和请求次数收费</li>
            <li>使用特定的 IAM 用户并限制其权限，而不是使用根账户</li>
            <li>如需降低成本，可考虑设置生命周期规则或使用 S3 Glacier 存储类</li>
            <li>密钥具有访问您 S3 资源的权限，请妥善保管</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTencentGuide = () => (
    <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
      <h3 className="font-semibold text-blue-800 mb-2">腾讯云 COS 配置详细说明</h3>
      <div className="space-y-3">
        <p className="text-gray-700">
          腾讯云对象存储（COS）是腾讯云提供的存储服务，具有高可扩展性、低成本、可靠和安全的特点。
        </p>
        
        <div className="bg-white p-3 rounded border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-1">配置步骤：</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <span className="font-medium">注册腾讯云账户：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>访问 <a href="https://cloud.tencent.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">腾讯云官网</a> 注册账户</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">创建存储桶：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>登录腾讯云控制台</li>
                <li>进入对象存储 COS 产品页面</li>
                <li>点击 "创建存储桶"</li>
                <li>选择一个名称、地域和访问权限</li>
                <li>如需公开访问图片，设置访问权限为"公有读私有写"</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">获取密钥：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>在控制台右上角点击您的账号</li>
                <li>选择 "访问管理" → "访问密钥" → "API 密钥管理"</li>
                <li>创建或查看您的 SecretId 和 SecretKey</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">填写配置信息：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>SecretId: 您的腾讯云 API 密钥 SecretId</li>
                <li>SecretKey: 您的腾讯云 API 密钥 SecretKey</li>
                <li>Bucket: 存储桶名称</li>
                <li>Region: 存储桶所在地域（如 ap-guangzhou）</li>
              </ol>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">注意事项：</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>腾讯云 COS 根据存储量和流量收费，新用户通常有免费额度</li>
            <li>如需降低成本，可以选择低频存储或归档存储类型</li>
            <li>可以配置 CDN 加速提高图片访问速度</li>
            <li>密钥具有访问您云资源的权限，请妥善保管</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAliyunGuide = () => (
    <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
      <h3 className="font-semibold text-blue-800 mb-2">阿里云 OSS 配置详细说明</h3>
      <div className="space-y-3">
        <p className="text-gray-700">
          阿里云对象存储服务（OSS）提供海量、安全、低成本、高可靠的云存储服务，适合各种图片存储需求。
        </p>
        
        <div className="bg-white p-3 rounded border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-1">配置步骤：</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <span className="font-medium">注册阿里云账户：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>访问 <a href="https://www.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">阿里云官网</a> 注册账户</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">创建 OSS 存储桶：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>登录阿里云控制台</li>
                <li>搜索并进入 OSS 服务</li>
                <li>点击 "创建 Bucket"</li>
                <li>设置存储桶名称、地域、存储类型等</li>
                <li>如需公开访问图片，设置读写权限为"公共读"</li>
                <li>其他设置保持默认，点击 "确定"</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">创建 AccessKey：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>在控制台右上角点击您的头像</li>
                <li>选择 "AccessKey 管理"</li>
                <li>创建一个子用户 AccessKey 而不是使用主账号（更安全）</li>
                <li>记录生成的 AccessKey ID 和 AccessKey Secret</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">填写配置信息：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>AccessKey: 您创建的 AccessKey ID</li>
                <li>SecretKey: 您创建的 AccessKey Secret</li>
                <li>Bucket: OSS 存储桶名称</li>
                <li>Region: 存储桶所在地域（如 oss-cn-hangzhou）</li>
              </ol>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">注意事项：</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>阿里云 OSS 是按量计费服务，会根据存储量和流量收费</li>
            <li>建议启用 CDN 加速，提高图片访问速度并可能降低流量费用</li>
            <li>使用子账号的 AccessKey 并限制其权限，增强安全性</li>
            <li>可以设置生命周期规则自动转换存储类型或删除文件，降低成本</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderQiniuGuide = () => (
    <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
      <h3 className="font-semibold text-blue-800 mb-2">七牛云配置详细说明</h3>
      <div className="space-y-3">
        <p className="text-gray-700">
          七牛云是国内知名的云存储服务提供商，其对象存储服务为图片等静态资源提供高速、安全的存储和分发。
        </p>
        
        <div className="bg-white p-3 rounded border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-1">配置步骤：</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <span className="font-medium">注册七牛云账户：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>访问 <a href="https://www.qiniu.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">七牛云官网</a> 注册账户</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">创建存储空间：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>登录七牛云控制台</li>
                <li>进入对象存储 → 空间管理</li>
                <li>点击 "新建空间"</li>
                <li>填写空间名称，选择存储区域和访问控制</li>
                <li>如需公开访问，选择 "公开空间"</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">获取密钥：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>在七牛云控制台，点击右上角的个人头像</li>
                <li>选择 "密钥管理"</li>
                <li>获取 AccessKey 和 SecretKey</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">绑定域名：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>七牛云要求使用自定义域名访问图片</li>
                <li>在空间设置中，进入 "域名管理"</li>
                <li>绑定您自己的域名或使用七牛提供的测试域名</li>
                <li>如使用自定义域名，需要在您的 DNS 服务商处添加 CNAME 记录</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">填写配置信息：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>AccessKey: 您的七牛云 AccessKey</li>
                <li>SecretKey: 您的七牛云 SecretKey</li>
                <li>Bucket: 存储空间名称</li>
                <li>Domain: 绑定的域名（包含 http:// 或 https:// 前缀）</li>
              </ol>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">注意事项：</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>七牛云要求必须使用自定义域名才能访问存储的资源</li>
            <li>七牛云提供测试域名（30天有效），但生产环境必须使用自己的域名</li>
            <li>七牛云按存储量和流量计费，新用户有一定免费额度</li>
            <li>七牛云自带 CDN 加速功能，访问速度较快</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderCustomGuide = () => (
    <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
      <h3 className="font-semibold text-blue-800 mb-2">自定义服务器配置详细说明</h3>
      <div className="space-y-3">
        <p className="text-gray-700">
          自定义服务器选项允许您将图片上传到您自己实现的API端点，可以是您自己的服务器或其他云服务。
        </p>
        
        <div className="bg-white p-3 rounded border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-1">配置步骤：</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <span className="font-medium">准备API端点：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>您需要实现一个接收图片上传的API端点</li>
                <li>API应接受multipart/form-data格式的POST请求</li>
                <li>API应处理名为"file"的文件字段</li>
                <li>API应返回JSON格式的响应，包含上传成功的图片URL</li>
              </ol>
            </li>
            <li>
              <span className="font-medium">API返回格式示例：</span>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
{`{
  "success": true,
  "url": "https://your-domain.com/images/example.jpg",
  "filename": "example.jpg"
}`}
              </pre>
            </li>
            <li>
              <span className="font-medium">填写配置信息：</span>
              <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                <li>API URL: 您的图片上传API地址</li>
                <li>API Key: 如果您的API需要认证，请提供密钥（可选）</li>
              </ol>
            </li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">注意事项：</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>确保您的API支持跨域请求(CORS)，否则上传可能会失败</li>
            <li>API应该始终返回包含success字段的JSON响应</li>
            <li>如果提供了API密钥，它将作为"Authorization: Bearer YOUR_API_KEY"头部发送</li>
            <li>API还可以接收可选的"path"参数，用于指定图片的存储路径</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <h4 className="font-medium text-green-800 mb-1">自定义API示例代码：</h4>
          <details>
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">查看Node.js示例(Express)</summary>
            <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto text-xs">
{`const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

// 启用CORS
app.use(cors());

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.body.path 
      ? path.join('uploads', req.body.path) 
      : 'uploads';
    
    // 确保目录存在
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  }
});

const upload = multer({ storage });

// 上传端点
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: 'No file uploaded' 
    });
  }
  
  // 构建URL
  const baseUrl = req.protocol + '://' + req.get('host');
  const filePath = req.file.path.replace(/\\\\/g, '/').replace(/\\\\/g, '/');
  const fileUrl = baseUrl + '/' + filePath;
  
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname
  });
});

// 提供静态文件访问
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(\`Image upload server running on port \${port}\`);
});`}
            </pre>
          </details>
          
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">查看PHP示例</summary>
            <pre className="bg-gray-100 p-2 rounded mt-2 overflow-x-auto text-xs">
{`<?php
// 允许跨域请求
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['success' => false, 'message' => 'Only POST method is allowed']);
    exit;
}

// 检查文件是否上传
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

// 获取路径参数
$path = isset($_POST['path']) ? $_POST['path'] : '';
$uploadDir = 'uploads/' . $path;

// 确保目录存在
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Failed to create upload directory']);
    exit;
}

// 生成唯一文件名
$filename = time() . '-' . mt_rand(1000000, 9999999) . '-' . $_FILES['file']['name'];
$uploadPath = $uploadDir . '/' . $filename;

// 移动上传的文件
if (!move_uploaded_file($_FILES['file']['tmp_name'], $uploadPath)) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
    exit;
}

// 构建URL
$baseUrl = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
$baseUrl .= $_SERVER['HTTP_HOST'];
$fileUrl = $baseUrl . '/' . $uploadPath;

// 返回成功响应
echo json_encode([
    'success' => true,
    'url' => $fileUrl,
    'filename' => $filename,
    'originalName' => $_FILES['file']['name']
]);
?>`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );

  const renderDefaultGuide = () => (
    <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
      <h3 className="font-semibold text-blue-800 mb-2">图片上传服务说明</h3>
      <div className="space-y-3">
        <p className="text-gray-700">
          请选择一个图片上传服务进行配置。上传服务负责存储您上传的图片并提供可访问的链接。
        </p>
        
        <div className="bg-white p-3 rounded border border-blue-100">
          <h4 className="font-medium text-blue-700 mb-1">可用服务对比：</h4>
          <table className="min-w-full border border-gray-200 text-xs mt-2">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 p-2 text-left">服务</th>
                <th className="border border-gray-200 p-2 text-left">优点</th>
                <th className="border border-gray-200 p-2 text-left">缺点</th>
                <th className="border border-gray-200 p-2 text-left">适用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 p-2">GitHub</td>
                <td className="border border-gray-200 p-2">免费、易于配置</td>
                <td className="border border-gray-200 p-2">有流量限制、不适合大量图片</td>
                <td className="border border-gray-200 p-2">个人项目、小型网站</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-2">AWS S3</td>
                <td className="border border-gray-200 p-2">高可靠性、可扩展、全球分布</td>
                <td className="border border-gray-200 p-2">收费、配置复杂</td>
                <td className="border border-gray-200 p-2">企业应用、高流量网站</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-2">腾讯云COS</td>
                <td className="border border-gray-200 p-2">国内访问快、有免费额度</td>
                <td className="border border-gray-200 p-2">收费、国外访问可能较慢</td>
                <td className="border border-gray-200 p-2">面向国内用户的网站</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-2">阿里云OSS</td>
                <td className="border border-gray-200 p-2">国内访问快、稳定可靠</td>
                <td className="border border-gray-200 p-2">收费、国外访问可能较慢</td>
                <td className="border border-gray-200 p-2">企业应用、电商网站</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-2">七牛云</td>
                <td className="border border-gray-200 p-2">专注CDN、上传快速</td>
                <td className="border border-gray-200 p-2">需要自定义域名</td>
                <td className="border border-gray-200 p-2">图片较多的内容网站</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-2">自定义服务器</td>
                <td className="border border-gray-200 p-2">完全自主控制</td>
                <td className="border border-gray-200 p-2">需要自行开发和维护</td>
                <td className="border border-gray-200 p-2">有特殊需求的项目</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-1">使用建议：</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>个人用户和小型项目可以选择GitHub（免费）或七牛云（有免费额度）</li>
            <li>企业用户建议使用AWS S3、腾讯云COS或阿里云OSS</li>
            <li>如果您已有自己的服务器或存储服务，可以选择自定义服务器</li>
            <li>请根据您的实际需求、访问地区和预算做出选择</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // 根据所选服务渲染对应的指南
  switch (serviceId) {
    case 'github':
      return renderGithubGuide();
    case 'aws':
      return renderAwsGuide();
    case 'tencent':
      return renderTencentGuide();
    case 'aliyun':
      return renderAliyunGuide();
    case 'qiniu':
      return renderQiniuGuide();
    case 'custom':
      return renderCustomGuide();
    default:
      return renderDefaultGuide();
  }
};

export default UploadServiceGuide; 