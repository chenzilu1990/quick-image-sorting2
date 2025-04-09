'use client';

import { createContext, useContext, ReactNode } from 'react';

// 创建一个上下文用于存储字典
export const DictionaryContext = createContext<{ [key: string]: any } | null>(null);

// 字典提供者组件
export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: { [key: string]: any };
  children: ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

// 使用字典的Hook
export function useDictionary() {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return dictionary;
} 