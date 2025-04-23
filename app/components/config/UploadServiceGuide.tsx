'use client';

import React from 'react';
import { useDictionary } from '@/components/hooks/client-dictionary';

interface UploadServiceGuideProps {
  serviceId: string;
}

const UploadServiceGuide: React.FC<UploadServiceGuideProps> = ({ serviceId }) => {
  const dict = useDictionary();
  const guides = dict.config?.uploadServiceGuides || {};

  const renderGithubGuide = () => {
    const guide = guides.github || {};
    
    return (
      <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">{guide.title}</h3>
        <div className="space-y-3">
          <p className="text-gray-700">{guide.intro}</p>
          
          <div className="bg-white p-3 rounded border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-1">{guide.steps}</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-medium">{guide.step1}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>
                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {guide.step1_1}
                    </a>
                  </li>
                  <li>{guide.step1_2}</li>
                  <li>{guide.step1_3}</li>
                  <li>{guide.step1_4}</li>
                  <li>{guide.step1_5}</li>
                  <li>{guide.step1_6}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step2}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step2_1}</li>
                  <li>
                    <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {guide.step2_2}
                    </a>
                  </li>
                  <li>{guide.step2_3}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step3}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step3_1}</li>
                  <li>{guide.step3_2}</li>
                  <li>{guide.step3_3}</li>
                </ol>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1">{guide.notes}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>{guide.note1}</li>
              <li>{guide.note2}</li>
              <li>{guide.note3}</li>
              <li>
                {guide.note4}
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderAwsGuide = () => {
    const guide = guides.aws || {};
    
    return (
      <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">{guide.title}</h3>
        <div className="space-y-3">
          <p className="text-gray-700">{guide.intro}</p>
          
          <div className="bg-white p-3 rounded border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-1">{guide.steps}</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-medium">{guide.step1}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>
                    <a href="https://aws.amazon.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {guide.step1_1}
                    </a>
                  </li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step2}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step2_1}</li>
                  <li>{guide.step2_2}</li>
                  <li>{guide.step2_3}</li>
                  <li>{guide.step2_4}</li>
                  <li>{guide.step2_5}</li>
                  <li>{guide.step2_6}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step3}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step3_1}</li>
                  <li>{guide.step3_2}</li>
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
                <span className="font-medium">{guide.step4}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step4_1}</li>
                  <li>{guide.step4_2}</li>
                  <li>{guide.step4_3}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step5}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step5_1}</li>
                  <li>{guide.step5_2}</li>
                  <li>{guide.step5_3}</li>
                  <li>{guide.step5_4}</li>
                </ol>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1">{guide.notes}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>{guide.note1}</li>
              <li>{guide.note2}</li>
              <li>{guide.note3}</li>
              <li>{guide.note4}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderTencentGuide = () => {
    const guide = guides.tencent || {};
    
    return (
      <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">{guide.title}</h3>
        <div className="space-y-3">
          <p className="text-gray-700">{guide.intro}</p>
          
          <div className="bg-white p-3 rounded border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-1">{guide.steps}</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-medium">{guide.step1}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>
                    <a href="https://cloud.tencent.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {guide.step1_1}
                    </a>
                  </li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step2}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step2_1}</li>
                  <li>{guide.step2_2}</li>
                  <li>{guide.step2_3}</li>
                  <li>{guide.step2_4}</li>
                  <li>{guide.step2_5}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step3}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step3_1}</li>
                  <li>{guide.step3_2}</li>
                  <li>{guide.step3_3}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step4}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step4_1}</li>
                  <li>{guide.step4_2}</li>
                  <li>{guide.step4_3}</li>
                  <li>{guide.step4_4}</li>
                </ol>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1">{guide.notes}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>{guide.note1}</li>
              <li>{guide.note2}</li>
              <li>{guide.note3}</li>
              <li>{guide.note4}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderAliyunGuide = () => {
    const guide = guides.aliyun || {};
    
    return (
      <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">{guide.title}</h3>
        <div className="space-y-3">
          <p className="text-gray-700">{guide.intro}</p>
          
          <div className="bg-white p-3 rounded border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-1">{guide.steps}</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-medium">{guide.step1}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>
                    <a href="https://www.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {guide.step1_1}
                    </a>
                  </li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step2}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step2_1}</li>
                  <li>{guide.step2_2}</li>
                  <li>{guide.step2_3}</li>
                  <li>{guide.step2_4}</li>
                  <li>{guide.step2_5}</li>
                  <li>{guide.step2_6}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step3}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step3_1}</li>
                  <li>{guide.step3_2}</li>
                  <li>{guide.step3_3}</li>
                  <li>{guide.step3_4}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step4}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step4_1}</li>
                  <li>{guide.step4_2}</li>
                  <li>{guide.step4_3}</li>
                  <li>{guide.step4_4}</li>
                </ol>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1">{guide.notes}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>{guide.note1}</li>
              <li>{guide.note2}</li>
              <li>{guide.note3}</li>
              <li>{guide.note4}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderQiniuGuide = () => {
    const guide = guides.qiniu || {};
    
    return (
      <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">{guide.title}</h3>
        <div className="space-y-3">
          <p className="text-gray-700">{guide.intro}</p>
          
          <div className="bg-white p-3 rounded border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-1">{guide.steps}</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-medium">{guide.step1}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>
                    <a href="https://www.qiniu.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {guide.step1_1}
                    </a>
                  </li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step2}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step2_1}</li>
                  <li>{guide.step2_2}</li>
                  <li>{guide.step2_3}</li>
                  <li>{guide.step2_4}</li>
                  <li>{guide.step2_5}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step3}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step3_1}</li>
                  <li>{guide.step3_2}</li>
                  <li>{guide.step3_3}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step4}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step4_1}</li>
                  <li>{guide.step4_2}</li>
                  <li>{guide.step4_3}</li>
                  <li>{guide.step4_4}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step5}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step5_1}</li>
                  <li>{guide.step5_2}</li>
                  <li>{guide.step5_3}</li>
                  <li>{guide.step5_4}</li>
                </ol>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1">{guide.notes}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>{guide.note1}</li>
              <li>{guide.note2}</li>
              <li>{guide.note3}</li>
              <li>{guide.note4}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomGuide = () => {
    const guide = guides.custom || {};
    
    return (
      <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">{guide.title}</h3>
        <div className="space-y-3">
          <p className="text-gray-700">{guide.intro}</p>
          
          <div className="bg-white p-3 rounded border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-1">{guide.steps}</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <span className="font-medium">{guide.step1}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step1_1}</li>
                  <li>{guide.step1_2}</li>
                  <li>{guide.step1_3}</li>
                  <li>{guide.step1_4}</li>
                </ol>
              </li>
              <li>
                <span className="font-medium">{guide.step2}</span>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
{`{
  "success": true,
  "url": "https://your-domain.com/images/example.jpg",
  "filename": "example.jpg"
}`}
                </pre>
              </li>
              <li>
                <span className="font-medium">{guide.step3}</span>
                <ol className="list-[lower-alpha] list-inside ml-5 mt-1 space-y-1 text-gray-600">
                  <li>{guide.step3_1}</li>
                  <li>{guide.step3_2}</li>
                </ol>
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1">{guide.notes}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>{guide.note1}</li>
              <li>{guide.note2}</li>
              <li>{guide.note3}</li>
              <li>{guide.note4}</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <h4 className="font-medium text-green-800 mb-1">{guide.codeExamples}</h4>
            <details>
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">{guide.nodeExample}</summary>
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
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">{guide.phpExample}</summary>
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
  };

  const renderDefaultGuide = () => {
    const guide = guides.default || {};
    
    return (
      <div className="service-guide bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
        <h3 className="font-semibold text-blue-800 mb-2">{guide.title}</h3>
        <div className="space-y-3">
          <p className="text-gray-700">{guide.intro}</p>
          
          <div className="bg-white p-3 rounded border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-1">{guide.comparison}</h4>
            <table className="min-w-full border border-gray-200 text-xs mt-2">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 p-2 text-left">{guide.service}</th>
                  <th className="border border-gray-200 p-2 text-left">{guide.advantages}</th>
                  <th className="border border-gray-200 p-2 text-left">{guide.disadvantages}</th>
                  <th className="border border-gray-200 p-2 text-left">{guide.useCases}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-2">GitHub</td>
                  <td className="border border-gray-200 p-2">{dict.config.freeOption}, {dict.config.easySetup}</td>
                  <td className="border border-gray-200 p-2">{dict.config.bandwidthLimits}</td>
                  <td className="border border-gray-200 p-2">{dict.config.personalProjects}, {dict.config.smallWebsites}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2">AWS S3</td>
                  <td className="border border-gray-200 p-2">{dict.config.highReliability}</td>
                  <td className="border border-gray-200 p-2">{dict.config.paidOption}, {dict.config.complexSetup}</td>
                  <td className="border border-gray-200 p-2">{dict.config.enterpriseUse}, {dict.config.highTrafficSites}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2">{dict.config.tencentService}</td>
                  <td className="border border-gray-200 p-2">{dict.config.fastChinaAccess}</td>
                  <td className="border border-gray-200 p-2">{dict.config.paidOption}</td>
                  <td className="border border-gray-200 p-2">{dict.config.chinaBased}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2">{dict.config.aliyunService}</td>
                  <td className="border border-gray-200 p-2">{dict.config.fastChinaAccess}</td>
                  <td className="border border-gray-200 p-2">{dict.config.paidOption}</td>
                  <td className="border border-gray-200 p-2">{dict.config.enterpriseUse}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2">{dict.config.qiniuService}</td>
                  <td className="border border-gray-200 p-2">{dict.config.integratedCDN}</td>
                  <td className="border border-gray-200 p-2">{dict.config.customDomainRequired}</td>
                  <td className="border border-gray-200 p-2">{dict.config.contentSites}</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-2">{dict.config.customService}</td>
                  <td className="border border-gray-200 p-2">{dict.config.fullControl}</td>
                  <td className="border border-gray-200 p-2">{dict.config.selfMaintenance}</td>
                  <td className="border border-gray-200 p-2">{dict.config.specialNeeds}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1">{guide.recommendations}</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>{guide.forPersonal}</li>
              <li>{guide.forEnterprise}</li>
              <li>{guide.forCustom}</li>
              <li>{guide.finalTip}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

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