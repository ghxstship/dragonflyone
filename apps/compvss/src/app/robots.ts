import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compvss.ghxstship.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/pricing',
          '/about',
          '/contact',
          '/help',
          '/legal',
          '/status',
          '/security',
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
          '/my-',
          '/crew/',
          '/credentials/',
          '/schedule/',
          '/reports/',
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
