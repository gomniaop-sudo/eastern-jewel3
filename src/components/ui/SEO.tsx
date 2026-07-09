import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { seoConfig, siteConfig, pageSeoConfig } from '../../config';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object;
}

export interface PageSEOProps {
  page: keyof typeof pageSeoConfig;
}

const SEO = ({
  title = seoConfig.defaults.title,
  description = seoConfig.defaults.description,
  keywords = seoConfig.defaults.keywords,
  image = seoConfig.openGraph.image,
  url = siteConfig.url,
  type = seoConfig.openGraph.type,
  jsonLd,
}: SEOProps) => {
  const { i18n } = useTranslation();

  return (
    <Helmet>
      <html lang={i18n.language} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={i18n.language === 'ar' ? seoConfig.openGraph.locale.ar : seoConfig.openGraph.locale.en} />
      <meta name="twitter:card" content={seoConfig.twitter.card} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export function PageSEO({ page }: PageSEOProps) {
  const pageConfig = pageSeoConfig[page];
  return (
    <SEO
      title={pageConfig.title}
      description={pageConfig.description}
    />
  );
}

export default SEO;
