import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://atlvs.ghxstship.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/pricing',
          '/products',
          '/solutions',
          '/verticals',
          '/about',
          '/contact',
          '/blog',
          '/case-studies',
          '/guides',
          '/help',
          '/legal',
          '/status',
          '/security',
          '/changelog',
          '/demo',
          '/integrations',
          '/resources',
          '/careers',
          '/partners',
          '/press',
        ],
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard',
          '/onboarding',
          '/settings',
          '/profile',
          '/notifications',
          '/(authenticated)/',
          '/p/',
          '/portal/',
          '/admin/',
          '/sign/',
          '/pay/',
          '/proposal/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
