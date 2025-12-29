import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gvteway.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/events',
          '/events/*',
          '/artists',
          '/artists/*',
          '/venues',
          '/venues/*',
          '/browse',
          '/discover',
          '/search',
          '/calendar',
          '/about',
          '/contact',
          '/help',
          '/legal',
          '/status',
          '/accessibility',
          '/community',
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
          '/e/*/check-in',
          '/e/*/credentials',
          '/e/*/settlement',
          '/e/*/box-office',
          '/account/',
          '/cart',
          '/checkout',
          '/confirmation',
          '/wallet',
          '/orders',
          '/admin/',
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
