import { getDictionary } from '../i18n/dictionaries';
import HomeContent from './home-content';
import PageWrapper from './page-wrapper';
import { Locale } from '../i18n/settings';


export default async function IndexPage({ params: { lang } }: { params: { lang: Locale } }) {
  // 服务端加载所需的翻译字典
  const dictionary = await getDictionary(lang);
  
  return (
    <PageWrapper dictionary={dictionary}>
      <HomeContent params={{ lang }} />
    </PageWrapper>
  );
}