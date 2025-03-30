export const dynamic = 'force-dynamic';

// 处理OPTIONS预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function GET(request, { params }) {
  const { path } = params;
  const { searchParams } = new URL(request.url);
  
  // 将路径中的数组使用/正确连接，避免多余斜杠
  const pathStr = path.join('/');
  
  // 构建完整URL，包含查询参数
  const queryString = Array.from(searchParams.entries())
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  // 使用0.0.0.0而不是127.0.0.1
  const url = `http://0.0.0.0:8088/${pathStr}${queryString ? `?${queryString}` : ''}`;
  
  console.log(`代理转发GET请求到: ${url}`);
  
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return Response.json(data);
    } else {
      const data = await response.text();
      return new Response(data, {
        headers: {
          'Content-Type': contentType || 'text/plain'
        }
      });
    }
  } catch (error) {
    console.error(`代理GET请求出错:`, error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { path } = params;
  
  // 将路径中的数组使用/正确连接，避免多余斜杠
  const pathStr = path.join('/');
  
  let body;
  const contentType = request.headers.get('content-type');
  
  try {
    if (contentType && contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType && contentType.includes('multipart/form-data')) {
      // 处理FormData
      body = await request.formData();
    } else {
      body = await request.text();
    }
    
    // 使用0.0.0.0而不是127.0.0.1
    const targetUrl = `http://0.0.0.0:8088/${pathStr}`;
    console.log(`代理转发POST请求到: ${targetUrl}`);
    
    let response;
    if (body instanceof FormData) {
      response = await fetch(targetUrl, {
        method: 'POST',
        body: body
      });
    } else {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': contentType || 'application/json'
        },
        body: typeof body === 'string' ? body : JSON.stringify(body)
      });
    }
    
    const responseContentType = response.headers.get('content-type');
    
    if (responseContentType && responseContentType.includes('application/json')) {
      const data = await response.json();
      return Response.json(data);
    } else {
      const data = await response.text();
      return new Response(data, {
        headers: {
          'Content-Type': responseContentType || 'text/plain'
        }
      });
    }
  } catch (error) {
    console.error(`代理POST请求出错:`, error);
    return Response.json({ error: error.message }, { status: 500 });
  }
} 