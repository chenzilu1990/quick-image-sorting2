import { ReactNode } from 'react';
import { Metadata, Viewport } from 'next';
import Sidebar from '@/components/Sidebar';
import '@/globals.css';
import { i18n } from '@/i18n/settings';
import type { Locale } from '@/i18n/settings';
import { getDictionary } from '@/i18n/dictionaries';
import { DictionaryProvider } from '@/components/client-dictionary';

// 从环境变量获取网站信息
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '图片快速排序与重命名工具';
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '专业的在线图片排序和重命名工具，支持拖拽快速排序、多种重命名规则（Amazon规则、自定义序列等）、批量下载，提高产品图片处理效率。';
const siteKeywords = process.env.NEXT_PUBLIC_SITE_KEYWORDS || '在线图片排序,快速图片排序,图片重命名排序,Amazon图片命名,图片批量处理,产品图片管理,图片拖拽排序';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// 这里不再定义静态元数据，而是通过生成函数以支持动态语言
export async function generateMetadata({ params }: { params: { lang: Locale } }) {
  const locale = params.lang;

  return {
    title: `${siteName}`,
    description: siteDescription,
    keywords: siteKeywords,
    robots: 'index, follow',
    authors: [{ name: siteName }],
    openGraph: {
      title: `${siteName} | 在线图片排序软件`,
      description: siteDescription,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: siteName,
        }
      ]
    },
  };
}

// 为了支持静态生成，添加generateStaticParams函数
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

interface RootLayoutProps {
  children: ReactNode;
  params: { lang: Locale };
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  // 服务器端获取字典
  const dictionary = await getDictionary(params.lang);
  
  return (
    <html lang={params.lang}>
      <head>
        <link rel="canonical" href={siteUrl} />
        {/* 如果配置了Google Analytics */}
        {process.env.GA_TRACKING_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING_ID}`}></script>
            <script 
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.GA_TRACKING_ID}');
                `
              }}
            />
          </>
        )}
      </head>
      <body>
        {/* 全应用范围的字典提供者 */}
        <DictionaryProvider dictionary={dictionary}>
          <div className="main-layout">
            <Sidebar lang={params.lang} />
            <div className="content-container">
              {children}
            </div>
          </div>
        </DictionaryProvider>
      </body>
    </html>
  );
} 