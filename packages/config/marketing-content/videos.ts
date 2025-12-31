/**
 * Marketing Videos - Centralized Video Tutorial Content
 * Video tutorials and webinar recordings for learning GHXSTSHIP
 * 
 * Categories:
 * - Platform Overview
 * - Feature Tutorials
 * - Workflow Walkthroughs
 * - Webinar Recordings
 * - Customer Stories
 */

export interface Video {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  duration: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  embedId?: string;
  platform?: 'atlvs' | 'compvss' | 'gvteway' | 'all';
  tags?: string[];
  featured?: boolean;
  new?: boolean;
  publishedAt?: string;
  views?: number;
  relatedGuides?: string[];
  transcript?: boolean;
}

export type VideoCategory =
  | 'platform-overview'
  | 'feature-tutorials'
  | 'workflow-walkthroughs'
  | 'webinar-recordings'
  | 'customer-stories'
  | 'tips-tricks';

export const VIDEO_CATEGORIES: Record<VideoCategory, { label: string; description: string; icon: string }> = {
  'platform-overview': {
    label: 'Platform Overview',
    description: 'Introduction to GHXSTSHIP platforms',
    icon: 'Play',
  },
  'feature-tutorials': {
    label: 'Feature Tutorials',
    description: 'Deep dives into specific features',
    icon: 'Video',
  },
  'workflow-walkthroughs': {
    label: 'Workflow Walkthroughs',
    description: 'Step-by-step workflow demonstrations',
    icon: 'GitBranch',
  },
  'webinar-recordings': {
    label: 'Webinar Recordings',
    description: 'Past webinars and training sessions',
    icon: 'Users',
  },
  'customer-stories': {
    label: 'Customer Stories',
    description: 'Success stories from our customers',
    icon: 'Star',
  },
  'tips-tricks': {
    label: 'Tips & Tricks',
    description: 'Quick tips for power users',
    icon: 'Lightbulb',
  },
};

export const VIDEOS: Video[] = [
  // ============================================
  // PLATFORM OVERVIEW
  // ============================================
  {
    id: 'po-001',
    title: 'Welcome to GHXSTSHIP',
    description: 'An introduction to the GHXSTSHIP platform ecosystem. Learn about ATLVS, COMPVSS, and GVTEWAY and how they work together to power your live entertainment business.',
    category: 'platform-overview',
    duration: '5:30',
    thumbnailUrl: '/videos/thumbnails/welcome-ghxstship.jpg',
    embedId: 'ghxstship-welcome-001',
    platform: 'all',
    tags: ['introduction', 'overview', 'getting started'],
    featured: true,
    views: 12500,
    transcript: true,
  },
  {
    id: 'po-002',
    title: 'ATLVS Platform Tour',
    description: 'Complete tour of ATLVS, the business operations platform. See how to manage projects, budgets, vendors, and finances all in one place.',
    category: 'platform-overview',
    duration: '8:15',
    thumbnailUrl: '/videos/thumbnails/atlvs-tour.jpg',
    embedId: 'atlvs-platform-tour-001',
    platform: 'atlvs',
    tags: ['atlvs', 'tour', 'business', 'finance'],
    featured: true,
    views: 8200,
    transcript: true,
  },
  {
    id: 'po-003',
    title: 'COMPVSS Platform Tour',
    description: 'Complete tour of COMPVSS, the production operations platform. See how to manage crews, schedules, credentials, and run-of-show.',
    category: 'platform-overview',
    duration: '7:45',
    thumbnailUrl: '/videos/thumbnails/compvss-tour.jpg',
    embedId: 'compvss-platform-tour-001',
    platform: 'compvss',
    tags: ['compvss', 'tour', 'crew', 'production'],
    featured: true,
    views: 7800,
    transcript: true,
  },
  {
    id: 'po-004',
    title: 'GVTEWAY Platform Tour',
    description: 'Complete tour of GVTEWAY, the consumer experience platform. See how to sell tickets, engage fans, and manage the event experience.',
    category: 'platform-overview',
    duration: '7:00',
    thumbnailUrl: '/videos/thumbnails/gvteway-tour.jpg',
    embedId: 'gvteway-platform-tour-001',
    platform: 'gvteway',
    tags: ['gvteway', 'tour', 'ticketing', 'fans'],
    featured: true,
    views: 9100,
    transcript: true,
  },
  {
    id: 'po-005',
    title: 'Choosing Your GHXSTSHIP Tier',
    description: 'Understand the 7 pricing tiers and find the right fit for your organization. Learn about the BYO (Bring Your Own) model and upgrade paths.',
    category: 'platform-overview',
    duration: '6:20',
    platform: 'all',
    tags: ['pricing', 'tiers', 'plans', 'byo'],
    views: 5400,
    transcript: true,
  },
  {
    id: 'po-006',
    title: 'Understanding Roles & Permissions',
    description: 'Deep dive into the GHXSTSHIP role system. Learn about platform roles, event roles, and how permissions work across the ecosystem.',
    category: 'platform-overview',
    duration: '9:30',
    platform: 'all',
    tags: ['roles', 'permissions', 'access', 'rbac'],
    views: 4200,
    transcript: true,
    relatedGuides: ['gs-003'],
  },

  // ============================================
  // FEATURE TUTORIALS
  // ============================================
  {
    id: 'ft-001',
    title: 'Creating Your First Production',
    description: 'Step-by-step tutorial on creating a new production in ATLVS. From basic setup through team assignment and budget configuration.',
    category: 'feature-tutorials',
    duration: '12:00',
    thumbnailUrl: '/videos/thumbnails/first-production.jpg',
    embedId: 'atlvs-first-production-001',
    platform: 'atlvs',
    tags: ['production', 'create', 'setup', 'tutorial'],
    featured: true,
    views: 6800,
    transcript: true,
    relatedGuides: ['gs-001'],
  },
  {
    id: 'ft-002',
    title: 'Budget Management Deep Dive',
    description: 'Master budget management in ATLVS. Learn to create budgets, track actuals, analyze variance, and generate reports.',
    category: 'feature-tutorials',
    duration: '15:30',
    platform: 'atlvs',
    tags: ['budget', 'finance', 'tracking', 'reports'],
    views: 4500,
    transcript: true,
    relatedGuides: ['wf-001'],
  },
  {
    id: 'ft-003',
    title: 'Crew Scheduling Masterclass',
    description: 'Complete guide to crew scheduling in COMPVSS. Create shifts, assign crew, manage availability, and handle conflicts.',
    category: 'feature-tutorials',
    duration: '14:00',
    platform: 'compvss',
    tags: ['crew', 'scheduling', 'shifts', 'assignment'],
    views: 5200,
    transcript: true,
    relatedGuides: ['wf-002'],
  },
  {
    id: 'ft-004',
    title: 'Credential System Setup',
    description: 'Set up and manage the credential system in COMPVSS. Define credential types, access zones, and issue credentials to your team.',
    category: 'feature-tutorials',
    duration: '10:45',
    platform: 'compvss',
    tags: ['credentials', 'access', 'badges', 'security'],
    views: 3800,
    transcript: true,
  },
  {
    id: 'ft-005',
    title: 'Ticket Sales Configuration',
    description: 'Configure ticket sales in GVTEWAY. Set up ticket types, pricing tiers, promo codes, and sales windows.',
    category: 'feature-tutorials',
    duration: '11:30',
    platform: 'gvteway',
    tags: ['tickets', 'sales', 'pricing', 'configuration'],
    views: 5800,
    transcript: true,
    relatedGuides: ['wf-005'],
  },
  {
    id: 'ft-006',
    title: 'Vendor Management Workflow',
    description: 'Complete vendor management workflow in ATLVS. Onboarding, contracts, purchase orders, and invoice processing.',
    category: 'feature-tutorials',
    duration: '13:15',
    platform: 'atlvs',
    tags: ['vendor', 'procurement', 'contracts', 'invoices'],
    views: 3200,
    transcript: true,
    relatedGuides: ['wf-004'],
  },
  {
    id: 'ft-007',
    title: 'Run of Show Builder',
    description: 'Build and manage your run of show in COMPVSS. Add cues, timing, and department assignments. Share with your team.',
    category: 'feature-tutorials',
    duration: '9:00',
    platform: 'compvss',
    tags: ['ros', 'run of show', 'cues', 'schedule'],
    views: 4100,
    transcript: true,
  },
  {
    id: 'ft-008',
    title: 'Box Office Operations',
    description: 'Master box office operations in GVTEWAY. Will call, check-in, scanning, and day-of-show management.',
    category: 'feature-tutorials',
    duration: '10:00',
    platform: 'gvteway',
    tags: ['box office', 'will call', 'check-in', 'scanning'],
    views: 3500,
    transcript: true,
  },
  {
    id: 'ft-009',
    title: 'Custom Reports & Analytics',
    description: 'Build custom reports and dashboards. Data visualization, filtering, and scheduled report delivery.',
    category: 'feature-tutorials',
    duration: '12:30',
    platform: 'all',
    tags: ['reports', 'analytics', 'dashboards', 'data'],
    new: true,
    views: 2100,
    transcript: true,
    relatedGuides: ['af-001'],
  },
  {
    id: 'ft-010',
    title: 'Integrations Setup',
    description: 'Connect GHXSTSHIP with your other tools. Slack, Google Calendar, QuickBooks, and more.',
    category: 'feature-tutorials',
    duration: '8:45',
    platform: 'all',
    tags: ['integrations', 'slack', 'quickbooks', 'calendar'],
    views: 2800,
    transcript: true,
  },

  // ============================================
  // WORKFLOW WALKTHROUGHS
  // ============================================
  {
    id: 'ww-001',
    title: 'Event Lifecycle: Start to Finish',
    description: 'Complete walkthrough of an event from initial planning through settlement. See how ATLVS, COMPVSS, and GVTEWAY work together.',
    category: 'workflow-walkthroughs',
    duration: '25:00',
    platform: 'all',
    tags: ['lifecycle', 'end-to-end', 'workflow', 'complete'],
    featured: true,
    views: 7200,
    transcript: true,
  },
  {
    id: 'ww-002',
    title: 'Production Budget Workflow',
    description: 'Follow a production budget from creation through settlement. Budget setup, expense tracking, variance analysis, and final reconciliation.',
    category: 'workflow-walkthroughs',
    duration: '18:00',
    platform: 'atlvs',
    tags: ['budget', 'workflow', 'finance', 'settlement'],
    views: 3900,
    transcript: true,
  },
  {
    id: 'ww-003',
    title: 'Crew Day: Clock In to Clock Out',
    description: 'Follow a crew member through their entire day. Clock in, assignments, credentials, timekeeping, and clock out.',
    category: 'workflow-walkthroughs',
    duration: '12:00',
    platform: 'compvss',
    tags: ['crew', 'day', 'workflow', 'timekeeping'],
    views: 4500,
    transcript: true,
  },
  {
    id: 'ww-004',
    title: 'Fan Journey: Discovery to Door',
    description: 'Experience the fan journey from event discovery through ticket purchase to event day check-in.',
    category: 'workflow-walkthroughs',
    duration: '10:30',
    platform: 'gvteway',
    tags: ['fan', 'journey', 'tickets', 'experience'],
    views: 5100,
    transcript: true,
  },
  {
    id: 'ww-005',
    title: 'Advancing Process Walkthrough',
    description: 'Complete advancing workflow from request creation through completion. Artist, venue, and vendor advancing.',
    category: 'workflow-walkthroughs',
    duration: '14:00',
    platform: 'compvss',
    tags: ['advancing', 'rider', 'workflow', 'coordination'],
    views: 3200,
    transcript: true,
    relatedGuides: ['wf-006'],
  },
  {
    id: 'ww-006',
    title: 'Event Settlement Walkthrough',
    description: 'Step-by-step settlement process. Revenue reconciliation, expense allocation, splits, and report generation.',
    category: 'workflow-walkthroughs',
    duration: '16:00',
    platform: 'all',
    tags: ['settlement', 'reconciliation', 'workflow', 'accounting'],
    views: 2800,
    transcript: true,
    relatedGuides: ['wf-003'],
  },
  {
    id: 'ww-007',
    title: 'Show Day Operations',
    description: 'Managing show day in COMPVSS. Run of show execution, crew coordination, and real-time updates.',
    category: 'workflow-walkthroughs',
    duration: '15:00',
    platform: 'compvss',
    tags: ['show day', 'operations', 'live', 'execution'],
    new: true,
    views: 1900,
    transcript: true,
  },

  // ============================================
  // WEBINAR RECORDINGS
  // ============================================
  {
    id: 'wr-001',
    title: 'GHXSTSHIP 101: Getting Started',
    description: 'Recorded webinar covering platform basics for new users. Account setup, navigation, and first steps.',
    category: 'webinar-recordings',
    duration: '45:00',
    platform: 'all',
    tags: ['webinar', 'getting started', 'basics', 'new users'],
    publishedAt: '2024-12-15',
    views: 3200,
    transcript: true,
  },
  {
    id: 'wr-002',
    title: 'Festival Production Best Practices',
    description: 'Industry experts share best practices for festival production. Planning, crew management, and execution.',
    category: 'webinar-recordings',
    duration: '55:00',
    platform: 'all',
    tags: ['webinar', 'festival', 'best practices', 'industry'],
    publishedAt: '2024-12-01',
    views: 2800,
    transcript: true,
  },
  {
    id: 'wr-003',
    title: 'Financial Management for Producers',
    description: 'Webinar on financial management for live entertainment. Budgeting, cash flow, and profitability.',
    category: 'webinar-recordings',
    duration: '50:00',
    platform: 'atlvs',
    tags: ['webinar', 'finance', 'budgeting', 'producers'],
    publishedAt: '2024-11-15',
    views: 2100,
    transcript: true,
  },
  {
    id: 'wr-004',
    title: 'Crew Management Strategies',
    description: 'Expert panel on crew management. Scheduling, communication, and building reliable teams.',
    category: 'webinar-recordings',
    duration: '48:00',
    platform: 'compvss',
    tags: ['webinar', 'crew', 'management', 'strategies'],
    publishedAt: '2024-11-01',
    views: 1900,
    transcript: true,
  },
  {
    id: 'wr-005',
    title: 'Maximizing Ticket Revenue',
    description: 'Strategies for maximizing ticket revenue. Pricing, marketing, and fan engagement.',
    category: 'webinar-recordings',
    duration: '52:00',
    platform: 'gvteway',
    tags: ['webinar', 'tickets', 'revenue', 'marketing'],
    publishedAt: '2024-10-15',
    views: 2400,
    transcript: true,
  },
  {
    id: 'wr-006',
    title: 'API & Integration Deep Dive',
    description: 'Technical webinar on GHXSTSHIP API and integrations. For developers and technical teams.',
    category: 'webinar-recordings',
    duration: '60:00',
    platform: 'all',
    tags: ['webinar', 'api', 'integration', 'developer'],
    publishedAt: '2024-10-01',
    views: 1200,
    transcript: true,
  },

  // ============================================
  // CUSTOMER STORIES
  // ============================================
  {
    id: 'cs-001',
    title: 'How Festival X Streamlined Operations',
    description: 'Case study: How a major festival reduced operational overhead by 40% using GHXSTSHIP ENTERPRISE.',
    category: 'customer-stories',
    duration: '8:00',
    platform: 'all',
    tags: ['case study', 'festival', 'success', 'enterprise'],
    featured: true,
    views: 4500,
    transcript: true,
  },
  {
    id: 'cs-002',
    title: 'Production Company Transformation',
    description: 'How a production company replaced 5 tools with GHXSTSHIP PRODUCTION and improved efficiency.',
    category: 'customer-stories',
    duration: '7:30',
    platform: 'all',
    tags: ['case study', 'production', 'transformation', 'efficiency'],
    views: 3200,
    transcript: true,
  },
  {
    id: 'cs-003',
    title: 'Venue Success Story',
    description: 'How a venue increased ticket sales by 25% and improved fan experience with GVTEWAY.',
    category: 'customer-stories',
    duration: '6:45',
    platform: 'gvteway',
    tags: ['case study', 'venue', 'tickets', 'success'],
    views: 2800,
    transcript: true,
  },
  {
    id: 'cs-004',
    title: 'Crew Vendor Case Study',
    description: 'How a labor vendor uses COMPVSS JOIN to work across multiple client productions seamlessly.',
    category: 'customer-stories',
    duration: '7:00',
    platform: 'compvss',
    tags: ['case study', 'crew', 'vendor', 'join'],
    views: 2100,
    transcript: true,
  },

  // ============================================
  // TIPS & TRICKS
  // ============================================
  {
    id: 'tt-001',
    title: '5 Keyboard Shortcuts You Need to Know',
    description: 'Quick tips: Essential keyboard shortcuts to speed up your workflow in GHXSTSHIP.',
    category: 'tips-tricks',
    duration: '3:00',
    platform: 'all',
    tags: ['tips', 'shortcuts', 'productivity', 'quick'],
    views: 5200,
    transcript: true,
  },
  {
    id: 'tt-002',
    title: 'Dashboard Customization Tips',
    description: 'Quick tips: Customize your dashboard for maximum productivity.',
    category: 'tips-tricks',
    duration: '4:00',
    platform: 'all',
    tags: ['tips', 'dashboard', 'customization', 'productivity'],
    views: 3800,
    transcript: true,
  },
  {
    id: 'tt-003',
    title: 'Budget Variance Alerts Setup',
    description: 'Quick tips: Set up variance alerts to catch budget overruns early.',
    category: 'tips-tricks',
    duration: '3:30',
    platform: 'atlvs',
    tags: ['tips', 'budget', 'alerts', 'variance'],
    views: 2400,
    transcript: true,
  },
  {
    id: 'tt-004',
    title: 'Crew Scheduling Power Tips',
    description: 'Quick tips: Advanced scheduling techniques for crew coordinators.',
    category: 'tips-tricks',
    duration: '4:30',
    platform: 'compvss',
    tags: ['tips', 'crew', 'scheduling', 'advanced'],
    views: 2900,
    transcript: true,
  },
  {
    id: 'tt-005',
    title: 'Promo Code Strategies',
    description: 'Quick tips: Effective promo code strategies to boost ticket sales.',
    category: 'tips-tricks',
    duration: '3:45',
    platform: 'gvteway',
    tags: ['tips', 'promo', 'tickets', 'marketing'],
    views: 3100,
    transcript: true,
  },
  {
    id: 'tt-006',
    title: 'Mobile App Power Features',
    description: 'Quick tips: Hidden features in the GHXSTSHIP mobile app.',
    category: 'tips-tricks',
    duration: '4:15',
    platform: 'all',
    tags: ['tips', 'mobile', 'app', 'features'],
    new: true,
    views: 1800,
    transcript: true,
  },
];

/**
 * Get videos by category
 */
export function getVideosByCategory(category: VideoCategory): Video[] {
  return VIDEOS.filter((video) => video.category === category);
}

/**
 * Get videos by platform
 */
export function getVideosByPlatform(platform: 'atlvs' | 'compvss' | 'gvteway' | 'all'): Video[] {
  return VIDEOS.filter((video) => video.platform === platform || video.platform === 'all');
}

/**
 * Get featured videos
 */
export function getFeaturedVideos(): Video[] {
  return VIDEOS.filter((video) => video.featured);
}

/**
 * Get new videos
 */
export function getNewVideos(): Video[] {
  return VIDEOS.filter((video) => video.new);
}

/**
 * Get popular videos sorted by views
 */
export function getPopularVideos(limit?: number): Video[] {
  const sorted = [...VIDEOS].sort((a, b) => (b.views || 0) - (a.views || 0));
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Search videos by keyword
 */
export function searchVideos(query: string): Video[] {
  const lowerQuery = query.toLowerCase();
  return VIDEOS.filter(
    (video) =>
      video.title.toLowerCase().includes(lowerQuery) ||
      video.description.toLowerCase().includes(lowerQuery) ||
      video.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get total video duration for a playlist
 */
export function getPlaylistDuration(videoIds: string[]): string {
  let totalSeconds = 0;
  
  for (const id of videoIds) {
    const video = VIDEOS.find((v) => v.id === id);
    if (video) {
      const parts = video.duration.split(':');
      if (parts.length === 2) {
        totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else if (parts.length === 3) {
        totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      }
    }
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} minutes`;
}

/**
 * Get video count by category
 */
export function getVideoCountByCategory(): Record<VideoCategory, number> {
  const counts: Partial<Record<VideoCategory, number>> = {};
  for (const video of VIDEOS) {
    counts[video.category] = (counts[video.category] || 0) + 1;
  }
  return counts as Record<VideoCategory, number>;
}

export default VIDEOS;
