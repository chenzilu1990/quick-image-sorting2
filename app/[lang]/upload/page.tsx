import { Metadata } from 'next';
import ImageUploader from '@/components/upload/ImageUploader';

export const metadata: Metadata = {
  title: '图片上传示例',
  description: '上传图片并获取链接的示例页面',
};

export default function UploadPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">图片上传</h1>
          <p className="text-gray-600">上传图片并获取直接链接</p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg">
          <ImageUploader />
        </div>
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">API使用说明</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">上传图片</h3>
              <p className="text-gray-600 mb-2">使用POST请求上传图片并获取链接</p>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
                  {`POST /api/upload
Content-Type: multipart/form-data

- file: 图片文件 (必须)
- path: 存储路径 (可选)`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">返回数据</h3>
              <p className="text-gray-600 mb-2">上传成功后返回的数据格式</p>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
                  {`{
  "success": true,
  "url": "/api/image/uploads/example.jpg",
  "filename": "1234567890-abc123.jpg",
  "originalName": "example.jpg",
  "size": 102400,
  "type": "image/jpeg",
  "path": "uploads/example.jpg"
}`}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">访问图片</h3>
              <p className="text-gray-600 mb-2">使用返回的URL直接访问图片</p>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
                  {`GET /api/image/uploads/example.jpg`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 