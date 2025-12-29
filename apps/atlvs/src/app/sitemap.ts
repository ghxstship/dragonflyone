import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://atlvs.com';
  const now = new Date();

  const staticPages: Array<{
    path: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [
    // Homepage
    { path: '', changeFrequency: 'daily', priority: 1.0 },

    // Core product pages (high priority)
    { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/products/atlvs', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/products/compvss', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/products/gvteway', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/products/compare', changeFrequency: 'weekly', priority: 0.8 },

    // Solutions
    { path: '/solutions', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/solutions/artists', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/brand-ambassadors', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/contractors', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/destinations', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/event-staff', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/independent-contractors', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/investors', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/producers', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/production-crews', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/project-managers', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/promoters', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/public-safety', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/sponsors', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/subcontractors', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/vendors', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/solutions/venues', changeFrequency: 'monthly', priority: 0.7 },

    // Verticals
    { path: '/verticals/activations', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/verticals/destinations', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/verticals/installations', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/verticals/productions', changeFrequency: 'monthly', priority: 0.75 },

    // Marketing pages
    { path: '/features', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/demo', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/demo/request', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/generator', changeFrequency: 'weekly', priority: 0.75 },

    // Resources
    { path: '/resources', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.7 },
    { path: '/case-studies', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/guides', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/guides/getting-started', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/webinars', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/docs', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/docs/api', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/changelog', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/roadmap', changeFrequency: 'weekly', priority: 0.6 },

    // Help & Support
    { path: '/help', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/help/community', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/help/docs', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/help/faq', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/help/getting-started', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/help/releases', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/help/tutorials', changeFrequency: 'weekly', priority: 0.6 },

    // Company
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/careers', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/partners', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/partnerships', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/press', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/community', changeFrequency: 'weekly', priority: 0.6 },

    // Integrations
    { path: '/integrations', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/ecosystem', changeFrequency: 'monthly', priority: 0.6 },

    // Legal
    { path: '/legal', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/legal/accessibility', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/legal/cookies', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/legal/privacy', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/legal/sub-processors', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/legal/terms', changeFrequency: 'monthly', priority: 0.4 },

    // Status & Security
    { path: '/status', changeFrequency: 'hourly', priority: 0.6 },
    { path: '/security', changeFrequency: 'monthly', priority: 0.6 },

    // Authentication (lower priority)
    { path: '/auth/signin', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/auth/signup', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/auth/forgot-password', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/reset-password', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/magic-link', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/verify-email', changeFrequency: 'monthly', priority: 0.3 },

    // Onboarding
    { path: '/onboarding', changeFrequency: 'monthly', priority: 0.4 },

    // Portals
    { path: '/portal/artist', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/portal/crew', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/portal/investor', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/portal/sponsor', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/portal/vendor', changeFrequency: 'weekly', priority: 0.5 },

    // Feedback
    { path: '/feedback/bugs', changeFrequency: 'weekly', priority: 0.4 },
    { path: '/feedback/features', changeFrequency: 'weekly', priority: 0.4 },
  ];

  return staticPages.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
