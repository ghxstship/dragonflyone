export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'video.movie' | 'music.song';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonical?: string;
  noindex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  ogImage = '/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonical,
  noindex = false,
}: SEOMetadata) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ghxstship.com';
  const fullTitle = `${title} | GHXSTSHIP`;
  
  const metadata: Record<string, string> = {
    title: fullTitle,
    description,
  };

  if (keywords.length > 0) {
    metadata.keywords = keywords.join(', ');
  }

  if (noindex) {
    metadata.robots = 'noindex, nofollow';
  }

  if (canonical) {
    metadata.canonical = `${baseUrl}${canonical}`;
  }

  // Open Graph
  metadata['og:title'] = fullTitle;
  metadata['og:description'] = description;
  metadata['og:type'] = ogType;
  metadata['og:image'] = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;
  metadata['og:site_name'] = 'GHXSTSHIP';

  // Twitter
  metadata['twitter:card'] = twitterCard;
  metadata['twitter:title'] = fullTitle;
  metadata['twitter:description'] = description;
  metadata['twitter:image'] = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return metadata;
}

export function generateStructuredData(type: 'Organization' | 'Event' | 'Person', data: any) {
  const baseStructure = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  return {
    ...baseStructure,
    ...data,
  };
}
