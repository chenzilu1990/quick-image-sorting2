'use client';

import { createContext, useContext, ReactNode } from 'react';

// 创建字典上下文
export const DictionaryContext = createContext<Record<string, any>>({});

// 字典提供者组件
export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Record<string, any>;
  children: ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

// 客户端使用字典的Hook
export function useDictionary() {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) {
    console.warn('字典上下文未找到，返回空对象');
    return {}; // 降级处理，避免应用崩溃
  }
  return dictionary;
} 