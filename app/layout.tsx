import { ReactNode } from 'react';
import { Metadata } from 'next';

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
      <body>{children}</body>
    </html>
  );
} 