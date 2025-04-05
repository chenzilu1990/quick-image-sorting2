import { ReactNode } from 'react';
import { Metadata } from 'next';
import Sidebar from '@/app/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: '图片快速排序',
  description: '拖拽图片进行快速排序',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh">
      <body>
        <div className="main-layout">
          <Sidebar />
          <div className="content-container">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
} 