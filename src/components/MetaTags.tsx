import { FC } from 'react';
import { Helmet } from 'react-helmet';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const MetaTags: FC<MetaTagsProps> = ({
  title = 'Sloots - Caça-Níquel Online',
  description = 'Jogue Sloots, o caça-níquel mais divertido da web! Ganhe prêmios, suba de nível e divirta-se!',
  image = '/og-image.jpg',
  url = window.location.href
}) => {
  return (
    <Helmet>
      {/* Tags básicas */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default MetaTags; 