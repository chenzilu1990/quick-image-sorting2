'use client';

import { ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DictionaryProvider } from '../components/client-dictionary';
import type { Locale } from '../i18n/settings';

export default function PageWrapper({
  children,
  dictionary,
}: {
  children: ReactNode;
  dictionary: any;
}) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
}