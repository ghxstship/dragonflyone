/**
 * Marketing Webinars - Webinar Schedule and Registration
 * Live and upcoming webinars for GHXSTSHIP users
 * 
 * Types:
 * - Live Webinars (upcoming)
 * - Recurring Series
 * - On-Demand (recorded)
 */

export interface Webinar {
  id: string;
  title: string;
  description: string;
  type: WebinarType;
  series?: WebinarSeries;
  date?: string;
  time?: string;
  timezone?: string;
  duration: string;
  host: WebinarHost;
  speakers?: WebinarSpeaker[];
  platform?: 'atlvs' | 'compvss' | 'gvteway' | 'all';
  tags?: string[];
  featured?: boolean;
  registrationUrl?: string;
  recordingUrl?: string;
  maxAttendees?: number;
  currentRegistrations?: number;
  topics?: string[];
}

export interface WebinarHost {
  name: string;
  title: string;
  company: string;
  avatar?: string;
}

export interface WebinarSpeaker {
  name: string;
  title: string;
  company: string;
  bio?: string;
  avatar?: string;
}

export type WebinarType = 'live' | 'recurring' | 'on-demand';

export type WebinarSeries =
  | 'ghxstship-101'
  | 'feature-deep-dive'
  | 'industry-best-practices'
  | 'customer-success'
  | 'office-hours'
  | 'api-developer';

export const WEBINAR_SERIES: Record<WebinarSeries, { label: string; description: string; frequency: string }> = {
  'ghxstship-101': {
    label: 'GHXSTSHIP 101',
    description: 'Platform basics for new users',
    frequency: 'Monthly',
  },
  'feature-deep-dive': {
    label: 'Feature Deep Dive',
    description: 'In-depth exploration of specific features',
    frequency: 'Weekly',
  },
  'industry-best-practices': {
    label: 'Industry Best Practices',
    description: 'Expert insights from live entertainment professionals',
    frequency: 'Bi-weekly',
  },
  'customer-success': {
    label: 'Customer Success Stories',
    description: 'Learn from successful GHXSTSHIP customers',
    frequency: 'Monthly',
  },
  'office-hours': {
    label: 'Office Hours',
    description: 'Live Q&A with the GHXSTSHIP team',
    frequency: 'Weekly',
  },
  'api-developer': {
    label: 'API & Developer',
    description: 'Technical sessions for developers',
    frequency: 'Monthly',
  },
};

const DEFAULT_HOST: WebinarHost = {
  name: 'GHXSTSHIP Team',
  title: 'Product Education',
  company: 'GHXSTSHIP',
};

export const WEBINARS: Webinar[] = [
  // ============================================
  // UPCOMING LIVE WEBINARS
  // ============================================
  {
    id: 'live-001',
    title: 'GHXSTSHIP 101: Getting Started',
    description: 'New to GHXSTSHIP? Join us for a comprehensive introduction to the platform. We\'ll cover account setup, navigation, and your first steps in ATLVS, COMPVSS, and GVTEWAY.',
    type: 'live',
    series: 'ghxstship-101',
    date: '2025-01-15',
    time: '2:00 PM',
    timezone: 'EST',
    duration: '45 minutes',
    host: DEFAULT_HOST,
    platform: 'all',
    tags: ['getting started', 'basics', 'new users'],
    featured: true,
    registrationUrl: '/webinars/register/ghxstship-101-getting-started',
    maxAttendees: 500,
    currentRegistrations: 127,
    topics: [
      'Platform overview and ecosystem',
      'Account setup and configuration',
      'Navigating the dashboard',
      'Creating your first production',
      'Q&A session',
    ],
  },
  {
    id: 'live-002',
    title: 'Budget Management Masterclass',
    description: 'Master production budgeting in ATLVS. Learn to create comprehensive budgets, track actuals, analyze variance, and generate reports that stakeholders love.',
    type: 'live',
    series: 'feature-deep-dive',
    date: '2025-01-22',
    time: '1:00 PM',
    timezone: 'EST',
    duration: '60 minutes',
    host: {
      name: 'Sarah Chen',
      title: 'Senior Product Manager',
      company: 'GHXSTSHIP',
    },
    platform: 'atlvs',
    tags: ['budget', 'finance', 'atlvs'],
    registrationUrl: '/webinars/register/budget-management-masterclass',
    maxAttendees: 300,
    currentRegistrations: 89,
    topics: [
      'Budget structure and categories',
      'Tracking actuals in real-time',
      'Variance analysis and alerts',
      'Approval workflows',
      'Reporting and exports',
    ],
  },
  {
    id: 'live-003',
    title: 'Crew Scheduling Best Practices',
    description: 'Industry experts share their secrets for efficient crew scheduling. Learn strategies for managing availability, handling conflicts, and building reliable teams.',
    type: 'live',
    series: 'industry-best-practices',
    date: '2025-01-29',
    time: '3:00 PM',
    timezone: 'EST',
    duration: '60 minutes',
    host: DEFAULT_HOST,
    speakers: [
      {
        name: 'Mike Rodriguez',
        title: 'Production Manager',
        company: 'Live Nation',
        bio: '15+ years in live entertainment production',
      },
      {
        name: 'Jennifer Walsh',
        title: 'Crew Coordinator',
        company: 'AEG Presents',
        bio: 'Managed crews for 500+ events',
      },
    ],
    platform: 'compvss',
    tags: ['crew', 'scheduling', 'best practices'],
    featured: true,
    registrationUrl: '/webinars/register/crew-scheduling-best-practices',
    maxAttendees: 400,
    currentRegistrations: 156,
    topics: [
      'Building your crew database',
      'Efficient scheduling strategies',
      'Managing availability and conflicts',
      'Communication best practices',
      'Retention and relationship building',
    ],
  },
  {
    id: 'live-004',
    title: 'Maximizing Ticket Revenue',
    description: 'Strategies for maximizing ticket revenue through smart pricing, effective marketing, and fan engagement. Real examples and actionable tactics.',
    type: 'live',
    series: 'industry-best-practices',
    date: '2025-02-05',
    time: '2:00 PM',
    timezone: 'EST',
    duration: '60 minutes',
    host: DEFAULT_HOST,
    speakers: [
      {
        name: 'David Park',
        title: 'VP of Ticketing',
        company: 'Independent Venue Alliance',
        bio: 'Ticketing strategy expert',
      },
    ],
    platform: 'gvteway',
    tags: ['tickets', 'revenue', 'pricing', 'marketing'],
    registrationUrl: '/webinars/register/maximizing-ticket-revenue',
    maxAttendees: 350,
    currentRegistrations: 78,
    topics: [
      'Dynamic pricing strategies',
      'Promo code best practices',
      'Fan engagement for repeat sales',
      'Reducing no-shows',
      'Upselling and add-ons',
    ],
  },
  {
    id: 'live-005',
    title: 'API Integration Workshop',
    description: 'Technical workshop for developers integrating with the GHXSTSHIP API. Authentication, common use cases, and best practices.',
    type: 'live',
    series: 'api-developer',
    date: '2025-02-12',
    time: '11:00 AM',
    timezone: 'EST',
    duration: '90 minutes',
    host: {
      name: 'Alex Thompson',
      title: 'Lead Developer Advocate',
      company: 'GHXSTSHIP',
    },
    platform: 'all',
    tags: ['api', 'developer', 'integration', 'technical'],
    registrationUrl: '/webinars/register/api-integration-workshop',
    maxAttendees: 200,
    currentRegistrations: 45,
    topics: [
      'API authentication and setup',
      'Common integration patterns',
      'Webhook implementation',
      'Error handling best practices',
      'Live coding examples',
    ],
  },

  // ============================================
  // RECURRING SERIES
  // ============================================
  {
    id: 'recurring-001',
    title: 'Weekly Office Hours',
    description: 'Join us every Thursday for live Q&A with the GHXSTSHIP team. Bring your questions about any platform feature, workflow, or best practice.',
    type: 'recurring',
    series: 'office-hours',
    time: '12:00 PM',
    timezone: 'EST',
    duration: '30 minutes',
    host: DEFAULT_HOST,
    platform: 'all',
    tags: ['q&a', 'support', 'weekly'],
    featured: true,
    registrationUrl: '/webinars/register/weekly-office-hours',
    topics: [
      'Live Q&A',
      'Feature questions',
      'Workflow help',
      'Best practices',
      'Tips and tricks',
    ],
  },
  {
    id: 'recurring-002',
    title: 'Feature Friday',
    description: 'Every Friday, we deep dive into a specific GHXSTSHIP feature. Learn tips, tricks, and advanced techniques from our product team.',
    type: 'recurring',
    series: 'feature-deep-dive',
    time: '1:00 PM',
    timezone: 'EST',
    duration: '30 minutes',
    host: DEFAULT_HOST,
    platform: 'all',
    tags: ['features', 'tips', 'weekly'],
    topics: [
      'Feature overview',
      'Advanced techniques',
      'Real-world examples',
      'Tips and shortcuts',
      'Q&A',
    ],
  },
  {
    id: 'recurring-003',
    title: 'New User Onboarding',
    description: 'Weekly session for new GHXSTSHIP users. Get up to speed quickly with guided onboarding and live support.',
    type: 'recurring',
    series: 'ghxstship-101',
    time: '10:00 AM',
    timezone: 'EST',
    duration: '45 minutes',
    host: DEFAULT_HOST,
    platform: 'all',
    tags: ['onboarding', 'new users', 'weekly'],
    topics: [
      'Account setup',
      'Platform navigation',
      'First production',
      'Key features overview',
      'Getting help',
    ],
  },

  // ============================================
  // ON-DEMAND (RECORDED)
  // ============================================
  {
    id: 'ondemand-001',
    title: 'Festival Production Masterclass',
    description: 'Recorded masterclass on festival production. Industry veterans share insights on planning, execution, and scaling festival operations.',
    type: 'on-demand',
    series: 'industry-best-practices',
    duration: '90 minutes',
    host: DEFAULT_HOST,
    speakers: [
      {
        name: 'Rachel Green',
        title: 'Festival Director',
        company: 'Bonnaroo',
        bio: '20 years in festival production',
      },
      {
        name: 'Tom Martinez',
        title: 'Operations Director',
        company: 'Coachella',
        bio: 'Logistics and operations expert',
      },
    ],
    platform: 'all',
    tags: ['festival', 'production', 'masterclass'],
    featured: true,
    topics: [
      'Festival planning timeline',
      'Site operations',
      'Vendor management at scale',
      'Crew coordination',
      'Risk management',
      'Post-event analysis',
    ],
  },
  {
    id: 'ondemand-002',
    title: 'Financial Management for Producers',
    description: 'Comprehensive guide to financial management in live entertainment. Budgeting, cash flow, profitability, and settlement.',
    type: 'on-demand',
    series: 'industry-best-practices',
    duration: '75 minutes',
    host: DEFAULT_HOST,
    speakers: [
      {
        name: 'Lisa Chang',
        title: 'CFO',
        company: 'Paradigm Talent Agency',
        bio: 'Entertainment finance expert',
      },
    ],
    platform: 'atlvs',
    tags: ['finance', 'budget', 'producers'],
    topics: [
      'Production budgeting fundamentals',
      'Cash flow management',
      'Deal structures and splits',
      'Settlement best practices',
      'Financial reporting',
    ],
  },
  {
    id: 'ondemand-003',
    title: 'Building Your Crew Network',
    description: 'Strategies for building and maintaining a reliable crew network. Recruitment, retention, and relationship management.',
    type: 'on-demand',
    series: 'industry-best-practices',
    duration: '60 minutes',
    host: DEFAULT_HOST,
    speakers: [
      {
        name: 'James Wilson',
        title: 'Labor Coordinator',
        company: 'IATSE Local 1',
        bio: '25 years in entertainment labor',
      },
    ],
    platform: 'compvss',
    tags: ['crew', 'network', 'recruitment'],
    topics: [
      'Finding quality crew',
      'Vetting and onboarding',
      'Building loyalty',
      'Managing freelancers',
      'Scaling your network',
    ],
  },
  {
    id: 'ondemand-004',
    title: 'Fan Engagement Strategies',
    description: 'How to engage fans before, during, and after events. Build loyalty, drive repeat attendance, and create memorable experiences.',
    type: 'on-demand',
    series: 'industry-best-practices',
    duration: '55 minutes',
    host: DEFAULT_HOST,
    speakers: [
      {
        name: 'Amanda Foster',
        title: 'Director of Fan Experience',
        company: 'Madison Square Garden',
        bio: 'Fan engagement innovator',
      },
    ],
    platform: 'gvteway',
    tags: ['fans', 'engagement', 'experience'],
    topics: [
      'Pre-event engagement',
      'Day-of experience',
      'Post-event follow-up',
      'Loyalty programs',
      'Community building',
    ],
  },
  {
    id: 'ondemand-005',
    title: 'GHXSTSHIP API Deep Dive',
    description: 'Technical deep dive into the GHXSTSHIP API. Authentication, endpoints, webhooks, and integration patterns.',
    type: 'on-demand',
    series: 'api-developer',
    duration: '120 minutes',
    host: {
      name: 'Alex Thompson',
      title: 'Lead Developer Advocate',
      company: 'GHXSTSHIP',
    },
    platform: 'all',
    tags: ['api', 'developer', 'technical'],
    topics: [
      'API architecture overview',
      'Authentication methods',
      'Core endpoints',
      'Webhooks and events',
      'Rate limiting and best practices',
      'Code examples',
    ],
  },
  {
    id: 'ondemand-006',
    title: 'Customer Success: Festival X Case Study',
    description: 'How Festival X reduced operational overhead by 40% using GHXSTSHIP ENTERPRISE. Detailed case study with lessons learned.',
    type: 'on-demand',
    series: 'customer-success',
    duration: '45 minutes',
    host: DEFAULT_HOST,
    speakers: [
      {
        name: 'Chris Anderson',
        title: 'Operations Director',
        company: 'Festival X',
        bio: 'Led GHXSTSHIP implementation',
      },
    ],
    platform: 'all',
    tags: ['case study', 'success', 'enterprise'],
    featured: true,
    topics: [
      'Before GHXSTSHIP',
      'Implementation process',
      'Key wins and metrics',
      'Lessons learned',
      'Future plans',
    ],
  },
];

/**
 * Get webinars by type
 */
export function getWebinarsByType(type: WebinarType): Webinar[] {
  return WEBINARS.filter((webinar) => webinar.type === type);
}

/**
 * Get webinars by series
 */
export function getWebinarsBySeries(series: WebinarSeries): Webinar[] {
  return WEBINARS.filter((webinar) => webinar.series === series);
}

/**
 * Get webinars by platform
 */
export function getWebinarsByPlatform(platform: 'atlvs' | 'compvss' | 'gvteway' | 'all'): Webinar[] {
  return WEBINARS.filter((webinar) => webinar.platform === platform || webinar.platform === 'all');
}

/**
 * Get featured webinars
 */
export function getFeaturedWebinars(): Webinar[] {
  return WEBINARS.filter((webinar) => webinar.featured);
}

/**
 * Get upcoming live webinars sorted by date
 */
export function getUpcomingWebinars(): Webinar[] {
  const now = new Date();
  return WEBINARS
    .filter((webinar) => webinar.type === 'live' && webinar.date && new Date(webinar.date) >= now)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
}

/**
 * Get on-demand webinars
 */
export function getOnDemandWebinars(): Webinar[] {
  return WEBINARS.filter((webinar) => webinar.type === 'on-demand');
}

/**
 * Get recurring webinars
 */
export function getRecurringWebinars(): Webinar[] {
  return WEBINARS.filter((webinar) => webinar.type === 'recurring');
}

/**
 * Search webinars by keyword
 */
export function searchWebinars(query: string): Webinar[] {
  const lowerQuery = query.toLowerCase();
  return WEBINARS.filter(
    (webinar) =>
      webinar.title.toLowerCase().includes(lowerQuery) ||
      webinar.description.toLowerCase().includes(lowerQuery) ||
      webinar.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      webinar.topics?.some((topic) => topic.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get registration availability
 */
export function getRegistrationAvailability(webinarId: string): { available: boolean; spotsLeft: number } {
  const webinar = WEBINARS.find((w) => w.id === webinarId);
  if (!webinar || !webinar.maxAttendees) {
    return { available: true, spotsLeft: -1 };
  }
  const spotsLeft = webinar.maxAttendees - (webinar.currentRegistrations || 0);
  return { available: spotsLeft > 0, spotsLeft };
}

export default WEBINARS;
