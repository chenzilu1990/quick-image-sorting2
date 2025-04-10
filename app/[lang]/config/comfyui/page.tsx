import { getDictionary } from '@/i18n/dictionaries';
import PageWrapper from '../../page-wrapper';
import ComfyUIConfigClient from './comfyui-config-client';
import { Locale } from '@/i18n/settings';

export default async function ComfyUIConfigPage({ params: { lang } }: { params: { lang: Locale } }) {
  // 服务端加载所需的翻译字典
  const dictionary = await getDictionary(lang);
  
  return (
    <PageWrapper dictionary={dictionary}>
      <ComfyUIConfigClient />
    </PageWrapper>
  );
} 