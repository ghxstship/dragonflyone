/**
 * Gap 12 Remediation: Role-Specific Onboarding Flows
 * Creates customized onboarding paths based on user role
 */

import { PlatformRole, PLATFORM_ROLE_METADATA } from '../roles';

// ============================================================================
// TYPES
// ============================================================================

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string; // Component name to render
  required: boolean;
  order: number;
  estimatedMinutes: number;
  helpUrl?: string;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  targetRoles: PlatformRole[];
  steps: OnboardingStep[];
  completionRedirect: string;
}

export interface UserOnboardingProgress {
  flowId: string;
  completedSteps: string[];
  currentStepId: string | null;
  startedAt: Date;
  completedAt: Date | null;
  skippedSteps: string[];
}

// ============================================================================
// ONBOARDING STEPS LIBRARY
// ============================================================================

const COMMON_STEPS: Record<string, OnboardingStep> = {
  welcome: {
    id: 'welcome',
    title: 'Welcome to GHXSTSHIP',
    description: 'Learn about the platform and what you can do',
    component: 'WelcomeStep',
    required: true,
    order: 1,
    estimatedMinutes: 2,
  },
  profileSetup: {
    id: 'profile-setup',
    title: 'Complete Your Profile',
    description: 'Add your name, photo, and contact information',
    component: 'ProfileSetupStep',
    required: true,
    order: 2,
    estimatedMinutes: 3,
  },
  securitySetup: {
    id: 'security-setup',
    title: 'Security Settings',
    description: 'Set up two-factor authentication and security preferences',
    component: 'SecuritySetupStep',
    required: false,
    order: 3,
    estimatedMinutes: 5,
    helpUrl: '/help/security',
  },
  notificationPreferences: {
    id: 'notification-preferences',
    title: 'Notification Preferences',
    description: 'Choose how you want to receive updates',
    component: 'NotificationPreferencesStep',
    required: false,
    order: 4,
    estimatedMinutes: 2,
  },
};

const ATLVS_STEPS: Record<string, OnboardingStep> = {
  organizationSetup: {
    id: 'organization-setup',
    title: 'Organization Setup',
    description: 'Configure your organization settings and branding',
    component: 'OrganizationSetupStep',
    required: true,
    order: 5,
    estimatedMinutes: 10,
    helpUrl: '/help/organization',
  },
  teamInvite: {
    id: 'team-invite',
    title: 'Invite Your Team',
    description: 'Add team members and assign roles',
    component: 'TeamInviteStep',
    required: false,
    order: 6,
    estimatedMinutes: 5,
  },
  productionOverview: {
    id: 'production-overview',
    title: 'Production Management',
    description: 'Learn how to create and manage productions',
    component: 'ProductionOverviewStep',
    required: true,
    order: 7,
    estimatedMinutes: 5,
    helpUrl: '/help/productions',
  },
  financeOverview: {
    id: 'finance-overview',
    title: 'Finance & Budgets',
    description: 'Understand budgeting, expenses, and invoicing',
    component: 'FinanceOverviewStep',
    required: true,
    order: 8,
    estimatedMinutes: 5,
    helpUrl: '/help/finance',
  },
  vendorSetup: {
    id: 'vendor-setup',
    title: 'Vendor Management',
    description: 'Set up your vendor database and contracts',
    component: 'VendorSetupStep',
    required: false,
    order: 9,
    estimatedMinutes: 5,
  },
  dashboardTour: {
    id: 'dashboard-tour',
    title: 'Dashboard Tour',
    description: 'Explore your personalized dashboard',
    component: 'DashboardTourStep',
    required: true,
    order: 10,
    estimatedMinutes: 3,
  },
};

const COMPVSS_STEPS: Record<string, OnboardingStep> = {
  crewOverview: {
    id: 'crew-overview',
    title: 'Crew Management',
    description: 'Learn how to manage crew and assignments',
    component: 'CrewOverviewStep',
    required: true,
    order: 5,
    estimatedMinutes: 5,
    helpUrl: '/help/crew',
  },
  credentialSystem: {
    id: 'credential-system',
    title: 'Credential System',
    description: 'Understand how credentials and access work',
    component: 'CredentialSystemStep',
    required: true,
    order: 6,
    estimatedMinutes: 5,
    helpUrl: '/help/credentials',
  },
  scheduleManagement: {
    id: 'schedule-management',
    title: 'Schedule Management',
    description: 'Learn to create and manage event schedules',
    component: 'ScheduleManagementStep',
    required: true,
    order: 7,
    estimatedMinutes: 5,
  },
  safetyProtocols: {
    id: 'safety-protocols',
    title: 'Safety Protocols',
    description: 'Review safety procedures and incident reporting',
    component: 'SafetyProtocolsStep',
    required: true,
    order: 8,
    estimatedMinutes: 5,
    helpUrl: '/help/safety',
  },
  mobileAppSetup: {
    id: 'mobile-app-setup',
    title: 'Mobile App Setup',
    description: 'Download and configure the mobile app',
    component: 'MobileAppSetupStep',
    required: false,
    order: 9,
    estimatedMinutes: 3,
  },
};

const GVTEWAY_STEPS: Record<string, OnboardingStep> = {
  eventCreation: {
    id: 'event-creation',
    title: 'Creating Events',
    description: 'Learn how to create and publish events',
    component: 'EventCreationStep',
    required: true,
    order: 5,
    estimatedMinutes: 5,
    helpUrl: '/help/events',
  },
  ticketingSetup: {
    id: 'ticketing-setup',
    title: 'Ticketing Setup',
    description: 'Configure ticket types, pricing, and inventory',
    component: 'TicketingSetupStep',
    required: true,
    order: 6,
    estimatedMinutes: 10,
    helpUrl: '/help/ticketing',
  },
  venueConfiguration: {
    id: 'venue-configuration',
    title: 'Venue Configuration',
    description: 'Set up venue maps and seating charts',
    component: 'VenueConfigurationStep',
    required: false,
    order: 7,
    estimatedMinutes: 10,
  },
  marketingTools: {
    id: 'marketing-tools',
    title: 'Marketing Tools',
    description: 'Explore promotional and marketing features',
    component: 'MarketingToolsStep',
    required: false,
    order: 8,
    estimatedMinutes: 5,
  },
  paymentSetup: {
    id: 'payment-setup',
    title: 'Payment Setup',
    description: 'Connect your payment processor',
    component: 'PaymentSetupStep',
    required: true,
    order: 9,
    estimatedMinutes: 5,
    helpUrl: '/help/payments',
  },
};

const MEMBER_STEPS: Record<string, OnboardingStep> = {
  browseEvents: {
    id: 'browse-events',
    title: 'Discover Events',
    description: 'Learn how to find and explore events',
    component: 'BrowseEventsStep',
    required: true,
    order: 5,
    estimatedMinutes: 2,
  },
  ticketPurchase: {
    id: 'ticket-purchase',
    title: 'Buying Tickets',
    description: 'Understand the ticket purchase process',
    component: 'TicketPurchaseStep',
    required: true,
    order: 6,
    estimatedMinutes: 2,
  },
  walletSetup: {
    id: 'wallet-setup',
    title: 'Digital Wallet',
    description: 'Set up your digital ticket wallet',
    component: 'WalletSetupStep',
    required: false,
    order: 7,
    estimatedMinutes: 3,
  },
  communityFeatures: {
    id: 'community-features',
    title: 'Community Features',
    description: 'Connect with other fans and artists',
    component: 'CommunityFeaturesStep',
    required: false,
    order: 8,
    estimatedMinutes: 3,
  },
};

// ============================================================================
// ONBOARDING FLOWS
// ============================================================================

export const ONBOARDING_FLOWS: OnboardingFlow[] = [
  // Legend/Admin Flow
  {
    id: 'legend-admin',
    name: 'Platform Administrator',
    description: 'Complete onboarding for platform administrators',
    targetRoles: [
      PlatformRole.LEGEND_SUPER_ADMIN,
      PlatformRole.LEGEND_ADMIN,
      PlatformRole.LEGEND_DEVELOPER,
    ],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      { ...COMMON_STEPS.securitySetup, required: true }, // 2FA required for admins
      ATLVS_STEPS.organizationSetup,
      ATLVS_STEPS.teamInvite,
      ATLVS_STEPS.dashboardTour,
    ],
    completionRedirect: '/dashboard',
  },

  // ATLVS Super Admin Flow
  {
    id: 'atlvs-super-admin',
    name: 'ATLVS Administrator',
    description: 'Complete onboarding for ATLVS administrators',
    targetRoles: [PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      { ...COMMON_STEPS.securitySetup, required: true },
      ATLVS_STEPS.organizationSetup,
      ATLVS_STEPS.teamInvite,
      ATLVS_STEPS.productionOverview,
      ATLVS_STEPS.financeOverview,
      ATLVS_STEPS.vendorSetup,
      ATLVS_STEPS.dashboardTour,
    ],
    completionRedirect: '/dashboard',
  },

  // ATLVS Team Member Flow
  {
    id: 'atlvs-team-member',
    name: 'ATLVS Team Member',
    description: 'Get started as an ATLVS team member',
    targetRoles: [PlatformRole.ATLVS_TEAM_MEMBER],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      COMMON_STEPS.notificationPreferences,
      ATLVS_STEPS.productionOverview,
      ATLVS_STEPS.dashboardTour,
    ],
    completionRedirect: '/dashboard',
  },

  // ATLVS Viewer Flow
  {
    id: 'atlvs-viewer',
    name: 'ATLVS Viewer',
    description: 'Quick start for read-only access',
    targetRoles: [PlatformRole.ATLVS_VIEWER],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      ATLVS_STEPS.dashboardTour,
    ],
    completionRedirect: '/dashboard',
  },

  // COMPVSS Admin Flow
  {
    id: 'compvss-admin',
    name: 'COMPVSS Administrator',
    description: 'Complete onboarding for production operations',
    targetRoles: [PlatformRole.COMPVSS_ADMIN],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      { ...COMMON_STEPS.securitySetup, required: true },
      COMPVSS_STEPS.crewOverview,
      COMPVSS_STEPS.credentialSystem,
      COMPVSS_STEPS.scheduleManagement,
      COMPVSS_STEPS.safetyProtocols,
      COMPVSS_STEPS.mobileAppSetup,
    ],
    completionRedirect: '/dashboard',
  },

  // COMPVSS Team Member Flow
  {
    id: 'compvss-team-member',
    name: 'COMPVSS Team Member',
    description: 'Get started with production operations',
    targetRoles: [PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_COLLABORATOR],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      COMPVSS_STEPS.credentialSystem,
      COMPVSS_STEPS.safetyProtocols,
      COMPVSS_STEPS.mobileAppSetup,
    ],
    completionRedirect: '/dashboard',
  },

  // GVTEWAY Admin Flow
  {
    id: 'gvteway-admin',
    name: 'GVTEWAY Administrator',
    description: 'Complete onboarding for event management',
    targetRoles: [PlatformRole.GVTEWAY_ADMIN],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      { ...COMMON_STEPS.securitySetup, required: true },
      GVTEWAY_STEPS.eventCreation,
      GVTEWAY_STEPS.ticketingSetup,
      GVTEWAY_STEPS.venueConfiguration,
      GVTEWAY_STEPS.paymentSetup,
      GVTEWAY_STEPS.marketingTools,
    ],
    completionRedirect: '/dashboard',
  },

  // GVTEWAY Experience Creator Flow
  {
    id: 'gvteway-creator',
    name: 'Experience Creator',
    description: 'Start creating amazing events',
    targetRoles: [PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      GVTEWAY_STEPS.eventCreation,
      GVTEWAY_STEPS.ticketingSetup,
      GVTEWAY_STEPS.marketingTools,
    ],
    completionRedirect: '/events',
  },

  // GVTEWAY Venue Manager Flow
  {
    id: 'gvteway-venue-manager',
    name: 'Venue Manager',
    description: 'Set up and manage your venue',
    targetRoles: [PlatformRole.GVTEWAY_VENUE_MANAGER],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      GVTEWAY_STEPS.venueConfiguration,
      GVTEWAY_STEPS.eventCreation,
    ],
    completionRedirect: '/venues',
  },

  // GVTEWAY Artist Flow
  {
    id: 'gvteway-artist',
    name: 'Artist Profile',
    description: 'Set up your artist profile',
    targetRoles: [PlatformRole.GVTEWAY_ARTIST, PlatformRole.GVTEWAY_ARTIST_VERIFIED],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      {
        id: 'artist-profile',
        title: 'Artist Profile',
        description: 'Create your artist profile and bio',
        component: 'ArtistProfileStep',
        required: true,
        order: 5,
        estimatedMinutes: 10,
      },
      {
        id: 'artist-merch',
        title: 'Merchandise Setup',
        description: 'Set up your merchandise store',
        component: 'ArtistMerchStep',
        required: false,
        order: 6,
        estimatedMinutes: 5,
      },
    ],
    completionRedirect: '/profile',
  },

  // GVTEWAY Member Flow
  {
    id: 'gvteway-member',
    name: 'Member',
    description: 'Welcome to GVTEWAY',
    targetRoles: [
      PlatformRole.GVTEWAY_MEMBER,
      PlatformRole.GVTEWAY_MEMBER_PLUS,
      PlatformRole.GVTEWAY_MEMBER_EXTRA,
      PlatformRole.GVTEWAY_MEMBER_GUEST,
    ],
    steps: [
      COMMON_STEPS.welcome,
      COMMON_STEPS.profileSetup,
      MEMBER_STEPS.browseEvents,
      MEMBER_STEPS.ticketPurchase,
      MEMBER_STEPS.walletSetup,
      MEMBER_STEPS.communityFeatures,
    ],
    completionRedirect: '/discover',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the appropriate onboarding flow for a user's roles
 */
export function getOnboardingFlowForRoles(roles: PlatformRole[]): OnboardingFlow | null {
  // Priority order: Legend > ATLVS Admin > COMPVSS Admin > GVTEWAY Admin > Others
  for (const flow of ONBOARDING_FLOWS) {
    if (flow.targetRoles.some(role => roles.includes(role))) {
      return flow;
    }
  }
  return null;
}

/**
 * Get the highest priority role from a list
 */
export function getHighestPriorityRole(roles: PlatformRole[]): PlatformRole | null {
  const priorityOrder: PlatformRole[] = [
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.LEGEND_DEVELOPER,
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
    PlatformRole.COMPVSS_ADMIN,
    PlatformRole.GVTEWAY_ADMIN,
    PlatformRole.ATLVS_TEAM_MEMBER,
    PlatformRole.COMPVSS_TEAM_MEMBER,
    PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
    PlatformRole.GVTEWAY_VENUE_MANAGER,
  ];

  for (const role of priorityOrder) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return roles[0] || null;
}

/**
 * Calculate total estimated time for a flow
 */
export function getFlowEstimatedTime(flow: OnboardingFlow): number {
  return flow.steps.reduce((total, step) => total + step.estimatedMinutes, 0);
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(
  flow: OnboardingFlow,
  completedSteps: string[]
): number {
  if (flow.steps.length === 0) return 100;
  const completed = flow.steps.filter(step => completedSteps.includes(step.id)).length;
  return Math.round((completed / flow.steps.length) * 100);
}

/**
 * Get the next incomplete step
 */
export function getNextStep(
  flow: OnboardingFlow,
  completedSteps: string[],
  skippedSteps: string[] = []
): OnboardingStep | null {
  const sortedSteps = [...flow.steps].sort((a, b) => a.order - b.order);
  
  for (const step of sortedSteps) {
    if (!completedSteps.includes(step.id) && !skippedSteps.includes(step.id)) {
      return step;
    }
  }
  
  return null;
}

/**
 * Check if onboarding is complete
 */
export function isOnboardingComplete(
  flow: OnboardingFlow,
  completedSteps: string[]
): boolean {
  const requiredSteps = flow.steps.filter(step => step.required);
  return requiredSteps.every(step => completedSteps.includes(step.id));
}

/**
 * Get role-specific welcome message
 */
export function getWelcomeMessage(role: PlatformRole): string {
  const metadata = PLATFORM_ROLE_METADATA[role];
  if (!metadata) return 'Welcome to GHXSTSHIP!';

  switch (metadata.platform) {
    case 'legend':
      return 'Welcome, Legend! You have full platform access.';
    case 'atlvs':
      return 'Welcome to ATLVS - Your Business Operations Hub';
    case 'compvss':
      return 'Welcome to COMPVSS - Production Operations Center';
    case 'gvteway':
      return 'Welcome to GVTEWAY - The Ultimate Event Experience';
    default:
      return 'Welcome to GHXSTSHIP!';
  }
}
