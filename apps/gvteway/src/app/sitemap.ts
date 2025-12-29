import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://gvteway.com';
  const now = new Date();
  
  // Static pages with their priorities and change frequencies
  const staticPages: Array<{
    path: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }> = [
    // Homepage
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    
    // Core event discovery (high priority)
    { path: '/events', changeFrequency: 'hourly', priority: 0.95 },
    { path: '/search', changeFrequency: 'daily', priority: 0.9 },
    { path: '/browse', changeFrequency: 'daily', priority: 0.9 },
    { path: '/discover', changeFrequency: 'daily', priority: 0.85 },
    { path: '/discover/quiz', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/new-events', changeFrequency: 'hourly', priority: 0.85 },
    { path: '/calendar', changeFrequency: 'daily', priority: 0.8 },
    { path: '/nearby', changeFrequency: 'daily', priority: 0.8 },
    { path: '/deals', changeFrequency: 'daily', priority: 0.8 },
    
    // Event creation
    { path: '/events/create', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/events/templates', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/events/compare', changeFrequency: 'weekly', priority: 0.5 },
    
    // Categories and collections
    { path: '/experiences', changeFrequency: 'daily', priority: 0.8 },
    { path: '/tours', changeFrequency: 'daily', priority: 0.8 },
    { path: '/destinations', changeFrequency: 'weekly', priority: 0.75 },
    { path: '/packages', changeFrequency: 'weekly', priority: 0.7 },
    
    // Community features
    { path: '/community', changeFrequency: 'daily', priority: 0.7 },
    { path: '/community/challenges', changeFrequency: 'daily', priority: 0.6 },
    { path: '/community/fan-content', changeFrequency: 'daily', priority: 0.6 },
    { path: '/community/guidelines', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/community/polls', changeFrequency: 'daily', priority: 0.6 },
    { path: '/forums', changeFrequency: 'daily', priority: 0.65 },
    { path: '/creators', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/fan-clubs', changeFrequency: 'weekly', priority: 0.65 },
    { path: '/groups', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/watch-parties', changeFrequency: 'daily', priority: 0.6 },
    
    // Social features
    { path: '/friends', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/activity', changeFrequency: 'daily', priority: 0.5 },
    { path: '/match', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/ugc', changeFrequency: 'daily', priority: 0.5 },
    { path: '/photos', changeFrequency: 'daily', priority: 0.5 },
    { path: '/reviews', changeFrequency: 'daily', priority: 0.6 },
    
    // User features
    { path: '/my-events', changeFrequency: 'daily', priority: 0.7 },
    { path: '/favorites', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/wishlist', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/saved-searches', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/notifications', changeFrequency: 'daily', priority: 0.5 },
    { path: '/messages', changeFrequency: 'daily', priority: 0.5 },
    { path: '/profile', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/profile/badges', changeFrequency: 'weekly', priority: 0.4 },
    { path: '/profile/reputation', changeFrequency: 'weekly', priority: 0.4 },
    
    // Commerce
    { path: '/cart', changeFrequency: 'always', priority: 0.6 },
    { path: '/checkout', changeFrequency: 'always', priority: 0.6 },
    { path: '/gift-cards', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/merch', changeFrequency: 'daily', priority: 0.6 },
    { path: '/merch/bundles', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/resale', changeFrequency: 'daily', priority: 0.7 },
    { path: '/price-alerts', changeFrequency: 'weekly', priority: 0.5 },
    
    // Rewards and membership
    { path: '/rewards', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/membership', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/membership/benefits', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/referrals', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/fan-club', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/fan-club/exclusive-access', changeFrequency: 'weekly', priority: 0.5 },
    
    // Support and help
    { path: '/help', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/support/chat', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/lost-found', changeFrequency: 'weekly', priority: 0.4 },
    { path: '/accessibility', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/accessibility/request', changeFrequency: 'monthly', priority: 0.4 },
    
    // Content and info
    { path: '/content', changeFrequency: 'daily', priority: 0.5 },
    { path: '/directions', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/map', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/qa-sessions', changeFrequency: 'daily', priority: 0.5 },
    
    // Applications
    { path: '/apply', changeFrequency: 'weekly', priority: 0.5 },
    
    // Authentication (lower priority)
    { path: '/auth/signin', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/auth/signup', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/auth/forgot-password', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/reset-password', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/magic-link', changeFrequency: 'monthly', priority: 0.3 },
    { path: '/auth/verify-email', changeFrequency: 'monthly', priority: 0.3 },
    
    // Onboarding
    { path: '/onboarding', changeFrequency: 'monthly', priority: 0.4 },
  ];

  return staticPages.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
