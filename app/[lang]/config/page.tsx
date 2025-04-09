import { getDictionary } from '../../i18n/dictionaries';
import PageWrapper from '../page-wrapper';
import ConfigClient from './config-client';
import { Locale } from '../../i18n/settings';

export default async function ConfigPage({ params: { lang } }: { params: { lang: Locale } }) {
  // 服务端加载所需的翻译字典
  const dictionary = await getDictionary(lang);
  
  return (
    <PageWrapper dictionary={dictionary}>
      <ConfigClient />
    </PageWrapper>
  );
} 