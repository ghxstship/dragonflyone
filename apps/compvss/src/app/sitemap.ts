import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://compvss.com';
  const now = new Date();

  const staticPages: Array<{
    path: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [
    // Homepage
    { path: '', changeFrequency: 'daily', priority: 1.0 },

    // Core crew management (high priority)
    { path: '/directory', changeFrequency: 'daily', priority: 0.9 },
    { path: '/directory/availability', changeFrequency: 'daily', priority: 0.85 },
    { path: '/directory/filters', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/availability', changeFrequency: 'daily', priority: 0.85 },
    { path: '/skills', changeFrequency: 'weekly', priority: 0.8 },

    // Credentials
    { path: '/credentials', changeFrequency: 'daily', priority: 0.85 },
    { path: '/credentials/issue', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/credentials/reports', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/credentials/scan', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/credentials/types', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/credentials/zones', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/certifications', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/background-checks', changeFrequency: 'weekly', priority: 0.7 },

    // Time & Attendance
    { path: '/timekeeping', changeFrequency: 'daily', priority: 0.85 },
    { path: '/clock-in', changeFrequency: 'daily', priority: 0.8 },

    // Schedule & Operations
    { path: '/run-of-show', changeFrequency: 'daily', priority: 0.8 },
    { path: '/set-times', changeFrequency: 'daily', priority: 0.8 },
    { path: '/show-call', changeFrequency: 'daily', priority: 0.8 },
    { path: '/soundcheck', changeFrequency: 'daily', priority: 0.75 },
    { path: '/tech-rehearsal', changeFrequency: 'daily', priority: 0.75 },
    { path: '/build-strike', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/stage-management', changeFrequency: 'weekly', priority: 0.75 },

    // Safety & Incidents
    { path: '/emergency', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/incidents', changeFrequency: 'daily', priority: 0.75 },
    { path: '/risk-register', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/weather-contingency', changeFrequency: 'daily', priority: 0.7 },
    { path: '/backup-plans', changeFrequency: 'weekly', priority: 0.7 },

    // Quality & Issues
    { path: '/qa-checkpoints', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/punch-list', changeFrequency: 'daily', priority: 0.7 },
    { path: '/issues', changeFrequency: 'daily', priority: 0.7 },
    { path: '/troubleshooting', changeFrequency: 'weekly', priority: 0.65 },

    // Documentation
    { path: '/sops', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/sops/acknowledgments', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/sops/categories', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/sops/training', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/spec-sheets', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/drawings', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/templates', changeFrequency: 'weekly', priority: 0.65 },

    // Knowledge Base
    { path: '/knowledge', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/knowledge/brand-guidelines', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/knowledge/multilingual', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/knowledge/offline', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/knowledge/regulations', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/glossary', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/best-practices', changeFrequency: 'weekly', priority: 0.65 },

    // Opportunities & Bidding
    { path: '/opportunities', changeFrequency: 'daily', priority: 0.8 },
    { path: '/opportunities/bid-decision', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/opportunities/mobile', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/opportunities/proposals', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/opportunities/win-loss', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/bid-portal', changeFrequency: 'daily', priority: 0.75 },

    // Vendors & Subcontractors
    { path: '/subcontractors', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/vendor-portal', changeFrequency: 'weekly', priority: 0.7 },

    // Venues & Sites
    { path: '/venues', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/site-access', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/site-surveys', changeFrequency: 'weekly', priority: 0.65 },

    // Finance
    { path: '/expenses', changeFrequency: 'daily', priority: 0.7 },
    { path: '/settlement', changeFrequency: 'weekly', priority: 0.7 },

    // Logistics
    { path: '/deliveries', changeFrequency: 'daily', priority: 0.7 },
    { path: '/travel', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/maintenance', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/permits', changeFrequency: 'weekly', priority: 0.6 },

    // Communication & Social
    { path: '/crew-social', changeFrequency: 'daily', priority: 0.6 },
    { path: '/social-amplification', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/notifications', changeFrequency: 'daily', priority: 0.6 },

    // Portals
    { path: '/artist-portal', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/artists', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/stakeholder-portal', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/vip-management', changeFrequency: 'weekly', priority: 0.6 },

    // Other
    { path: '/photo-documentation', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/mentorship', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/my-rider', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/integrations', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/case-studies', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/profile', changeFrequency: 'weekly', priority: 0.5 },

    // Authentication (lower priority)
    { path: '/auth/signin', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/auth/signup', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/auth/forgot-password', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/reset-password', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/magic-link', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/verify-email', changeFrequency: 'monthly', priority: 0.3 },

    // Onboarding & Offline
    { path: '/onboarding', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/offline', changeFrequency: 'monthly', priority: 0.3 },
  ];

  return staticPages.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
