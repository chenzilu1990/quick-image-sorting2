import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from './app/i18n/settings';

function getLocale(request: NextRequest): string {
  // 从请求中获取 Accept-Language 头信息
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // 使用 Negotiator 获取最佳匹配的语言
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  // 使用 intl-localematcher 从支持的语言中匹配最佳语言
  return match(languages, i18n.locales, i18n.defaultLocale);
}

export function middleware(request: NextRequest) {
  // 处理跨域问题的中间件
  const response = NextResponse.next();
  
  // 添加CORS头
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 获取请求的路径名
  const pathname = request.nextUrl.pathname;
  
  // 检查路径名是否已经包含区域设置前缀
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // 如果路径中已包含区域设置，直接返回
  if (pathnameHasLocale) return response;
  
  // 获取当前请求的最佳匹配区域设置
  const locale = getLocale(request);
  
  // 创建新URL，添加区域设置前缀
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  request.nextUrl.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  // 重定向到带有区域设置的URL
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // 排除内部路径、静态资源和根目录下的特殊文件
    '/((?!api|_next/static|_next/image|favicon\.ico|sitemap\.xml|robots\.txt).*)',
  ],
}; 