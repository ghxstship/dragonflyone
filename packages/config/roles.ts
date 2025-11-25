/**
 * Complete Role System for GHXSTSHIP Platform
 * Defines all platform RBAC roles and event-level roles
 */

// ============================================================================
// PLATFORM RBAC ROLES
// ============================================================================

export enum PlatformRole {
  // Legend Roles (God Mode) - @ghxstship.pro email required
  LEGEND_SUPER_ADMIN = 'LEGEND_SUPER_ADMIN',
  LEGEND_ADMIN = 'LEGEND_ADMIN',
  LEGEND_DEVELOPER = 'LEGEND_DEVELOPER',
  LEGEND_COLLABORATOR = 'LEGEND_COLLABORATOR',
  LEGEND_SUPPORT = 'LEGEND_SUPPORT',
  LEGEND_INCOGNITO = 'LEGEND_INCOGNITO',

  // ATLVS Platform Roles
  ATLVS_SUPER_ADMIN = 'ATLVS_SUPER_ADMIN',
  ATLVS_ADMIN = 'ATLVS_ADMIN',
  ATLVS_TEAM_MEMBER = 'ATLVS_TEAM_MEMBER',
  ATLVS_VIEWER = 'ATLVS_VIEWER',

  // COMPVSS Platform Roles
  COMPVSS_ADMIN = 'COMPVSS_ADMIN',
  COMPVSS_TEAM_MEMBER = 'COMPVSS_TEAM_MEMBER',
  COMPVSS_COLLABORATOR = 'COMPVSS_COLLABORATOR',
  COMPVSS_VIEWER = 'COMPVSS_VIEWER',

  // GVTEWAY Platform Roles
  GVTEWAY_ADMIN = 'GVTEWAY_ADMIN',
  GVTEWAY_EXPERIENCE_CREATOR = 'GVTEWAY_EXPERIENCE_CREATOR',
  GVTEWAY_VENUE_MANAGER = 'GVTEWAY_VENUE_MANAGER',
  GVTEWAY_ARTIST_VERIFIED = 'GVTEWAY_ARTIST_VERIFIED',
  GVTEWAY_ARTIST = 'GVTEWAY_ARTIST',
  GVTEWAY_MEMBER_EXTRA = 'GVTEWAY_MEMBER_EXTRA',
  GVTEWAY_MEMBER_PLUS = 'GVTEWAY_MEMBER_PLUS',
  GVTEWAY_MEMBER = 'GVTEWAY_MEMBER',
  GVTEWAY_MEMBER_GUEST = 'GVTEWAY_MEMBER_GUEST',
  GVTEWAY_AFFILIATE = 'GVTEWAY_AFFILIATE',
  GVTEWAY_MODERATOR = 'GVTEWAY_MODERATOR',
}

// ============================================================================
// EVENT-LEVEL ROLES
// ============================================================================

export enum EventRole {
  // All Platforms Event Roles (ATLVS + COMPVSS + GVTEWAY access)
  EXECUTIVE = 'EXECUTIVE',
  CORE_AAA = 'CORE_AAA',
  AA = 'AA',
  PRODUCTION = 'PRODUCTION',
  MANAGEMENT = 'MANAGEMENT',

  // COMPVSS Event Roles
  CREW = 'CREW',
  STAFF = 'STAFF',
  VENDOR = 'VENDOR',
  ENTERTAINER = 'ENTERTAINER',
  ARTIST = 'ARTIST',
  AGENT = 'AGENT',
  MEDIA = 'MEDIA',
  SPONSOR = 'SPONSOR',
  PARTNER = 'PARTNER',
  INDUSTRY = 'INDUSTRY',
  INTERN = 'INTERN',
  VOLUNTEER = 'VOLUNTEER',

  // GVTEWAY Event Roles
  BACKSTAGE_L2 = 'BACKSTAGE_L2',
  BACKSTAGE_L1 = 'BACKSTAGE_L1',
  PLATINUM_VIP_L2 = 'PLATINUM_VIP_L2',
  PLATINUM_VIP_L1 = 'PLATINUM_VIP_L1',
  VIP_L3 = 'VIP_L3',
  VIP_L2 = 'VIP_L2',
  VIP_L1 = 'VIP_L1',
  GA_L5 = 'GA_L5',
  GA_L4 = 'GA_L4',
  GA_L3 = 'GA_L3',
  GA_L2 = 'GA_L2',
  GA_L1 = 'GA_L1',
  GUEST = 'GUEST',
  INFLUENCER = 'INFLUENCER',
  BRAND_AMBASSADOR = 'BRAND_AMBASSADOR',
  AFFILIATE = 'AFFILIATE',
}

// ============================================================================
// ROLE HIERARCHY & METADATA
// ============================================================================

export type RoleLevel = 'god' | 'admin' | 'manager' | 'member' | 'viewer';

export interface RoleMetadata {
  name: string;
  level: RoleLevel;
  platform: 'legend' | 'atlvs' | 'compvss' | 'gvteway';
  inheritsFrom?: PlatformRole;
  requiresEmail?: string;
  canImpersonate?: boolean;
  requiresPermissionToImpersonate?: boolean;
  description: string;
}

export const PLATFORM_ROLE_METADATA: Record<PlatformRole, RoleMetadata> = {
  // Legend Roles
  [PlatformRole.LEGEND_SUPER_ADMIN]: {
    name: 'Legend Super Admin',
    level: 'god',
    platform: 'legend',
    inheritsFrom: PlatformRole.ATLVS_SUPER_ADMIN,
    requiresEmail: '@ghxstship.pro',
    canImpersonate: true,
    description: 'Absolute platform control across all systems',
  },
  [PlatformRole.LEGEND_ADMIN]: {
    name: 'Legend Admin',
    level: 'god',
    platform: 'legend',
    inheritsFrom: PlatformRole.ATLVS_SUPER_ADMIN,
    requiresEmail: '@ghxstship.pro',
    canImpersonate: true,
    description: 'Internal product management with cross-app access',
  },
  [PlatformRole.LEGEND_DEVELOPER]: {
    name: 'Legend Developer',
    level: 'god',
    platform: 'legend',
    inheritsFrom: PlatformRole.ATLVS_SUPER_ADMIN,
    requiresEmail: '@ghxstship.pro',
    canImpersonate: true,
    description: 'Full repository access, internal product team',
  },
  [PlatformRole.LEGEND_COLLABORATOR]: {
    name: 'Legend Collaborator',
    level: 'god',
    platform: 'legend',
    inheritsFrom: PlatformRole.ATLVS_ADMIN,
    requiresEmail: '@ghxstship.pro',
    description: 'External scoped full repo access',
  },
  [PlatformRole.LEGEND_SUPPORT]: {
    name: 'Legend Support',
    level: 'god',
    platform: 'legend',
    inheritsFrom: PlatformRole.ATLVS_ADMIN,
    requiresEmail: '@ghxstship.pro',
    canImpersonate: true,
    requiresPermissionToImpersonate: true,
    description: 'Tech support with conditional user impersonation',
  },
  [PlatformRole.LEGEND_INCOGNITO]: {
    name: 'Legend Incognito',
    level: 'god',
    platform: 'legend',
    inheritsFrom: PlatformRole.ATLVS_SUPER_ADMIN,
    requiresEmail: '@ghxstship.pro',
    canImpersonate: true,
    description: 'Stealth mode operations with unrestricted impersonation',
  },

  // ATLVS Roles
  [PlatformRole.ATLVS_SUPER_ADMIN]: {
    name: 'ATLVS Super Admin',
    level: 'admin',
    platform: 'atlvs',
    inheritsFrom: PlatformRole.ATLVS_ADMIN,
    description: 'Full system administration and configuration',
  },
  [PlatformRole.ATLVS_ADMIN]: {
    name: 'ATLVS Admin',
    level: 'admin',
    platform: 'atlvs',
    inheritsFrom: PlatformRole.ATLVS_TEAM_MEMBER,
    description: 'Administrative access to business operations',
  },
  [PlatformRole.ATLVS_TEAM_MEMBER]: {
    name: 'ATLVS Team Member',
    level: 'member',
    platform: 'atlvs',
    inheritsFrom: PlatformRole.ATLVS_VIEWER,
    description: 'Work on assigned tasks and projects',
  },
  [PlatformRole.ATLVS_VIEWER]: {
    name: 'ATLVS Viewer',
    level: 'viewer',
    platform: 'atlvs',
    description: 'Read-only access to business data',
  },

  // COMPVSS Roles
  [PlatformRole.COMPVSS_ADMIN]: {
    name: 'COMPVSS Admin',
    level: 'admin',
    platform: 'compvss',
    inheritsFrom: PlatformRole.COMPVSS_TEAM_MEMBER,
    description: 'Full administrative access to production operations',
  },
  [PlatformRole.COMPVSS_TEAM_MEMBER]: {
    name: 'COMPVSS Team Member',
    level: 'member',
    platform: 'compvss',
    inheritsFrom: PlatformRole.COMPVSS_VIEWER,
    description: 'Work on assigned events and productions',
  },
  [PlatformRole.COMPVSS_COLLABORATOR]: {
    name: 'COMPVSS Collaborator',
    level: 'member',
    platform: 'compvss',
    inheritsFrom: PlatformRole.COMPVSS_VIEWER,
    description: 'Limited event access for external collaborators',
  },
  [PlatformRole.COMPVSS_VIEWER]: {
    name: 'COMPVSS Viewer',
    level: 'viewer',
    platform: 'compvss',
    description: 'Read-only access to production data',
  },

  // GVTEWAY Roles
  [PlatformRole.GVTEWAY_ADMIN]: {
    name: 'GVTEWAY Admin',
    level: 'admin',
    platform: 'gvteway',
    description: 'Full platform administration',
  },
  [PlatformRole.GVTEWAY_EXPERIENCE_CREATOR]: {
    name: 'Experience Creator',
    level: 'manager',
    platform: 'gvteway',
    inheritsFrom: PlatformRole.GVTEWAY_MEMBER,
    description: 'Create and manage experiences/events',
  },
  [PlatformRole.GVTEWAY_VENUE_MANAGER]: {
    name: 'Venue Manager',
    level: 'manager',
    platform: 'gvteway',
    inheritsFrom: PlatformRole.GVTEWAY_MEMBER,
    description: 'Manage venue profiles and operations',
  },
  [PlatformRole.GVTEWAY_ARTIST_VERIFIED]: {
    name: 'Verified Artist',
    level: 'member',
    platform: 'gvteway',
    inheritsFrom: PlatformRole.GVTEWAY_ARTIST,
    description: 'Verified artist with enhanced features',
  },
  [PlatformRole.GVTEWAY_ARTIST]: {
    name: 'Artist',
    level: 'member',
    platform: 'gvteway',
    inheritsFrom: PlatformRole.GVTEWAY_MEMBER,
    description: 'Artist profile and fan engagement',
  },
  [PlatformRole.GVTEWAY_MEMBER_EXTRA]: {
    name: 'Member Extra',
    level: 'member',
    platform: 'gvteway',
    inheritsFrom: PlatformRole.GVTEWAY_MEMBER_PLUS,
    description: 'Premium membership with exclusive benefits',
  },
  [PlatformRole.GVTEWAY_MEMBER_PLUS]: {
    name: 'Member Plus',
    level: 'member',
    platform: 'gvteway',
    inheritsFrom: PlatformRole.GVTEWAY_MEMBER,
    description: 'Enhanced membership with early access',
  },
  [PlatformRole.GVTEWAY_MEMBER]: {
    name: 'Member',
    level: 'member',
    platform: 'gvteway',
    description: 'Standard member access',
  },
  [PlatformRole.GVTEWAY_MEMBER_GUEST]: {
    name: 'Guest Member',
    level: 'member',
    platform: 'gvteway',
    inheritsFrom: PlatformRole.GVTEWAY_MEMBER,
    description: 'Temporary guest access',
  },
  [PlatformRole.GVTEWAY_AFFILIATE]: {
    name: 'Affiliate',
    level: 'member',
    platform: 'gvteway',
    inheritsFrom: PlatformRole.GVTEWAY_MEMBER,
    description: 'Affiliate marketing and referrals',
  },
  [PlatformRole.GVTEWAY_MODERATOR]: {
    name: 'Moderator',
    level: 'manager',
    platform: 'gvteway',
    description: 'Content moderation and community management',
  },
};

// Event Role Hierarchy Levels
export const EVENT_ROLE_HIERARCHY: Record<EventRole, number> = {
  // All Platform Access (Level 600+)
  [EventRole.EXECUTIVE]: 1000,
  [EventRole.CORE_AAA]: 900,
  [EventRole.AA]: 800,
  [EventRole.PRODUCTION]: 700,
  [EventRole.MANAGEMENT]: 600,

  // COMPVSS Event Roles
  [EventRole.CREW]: 500,
  [EventRole.STAFF]: 450,
  [EventRole.VENDOR]: 400,
  [EventRole.ENTERTAINER]: 350,
  [EventRole.ARTIST]: 350,
  [EventRole.AGENT]: 300,
  [EventRole.MEDIA]: 250,
  [EventRole.SPONSOR]: 200,
  [EventRole.PARTNER]: 200,
  [EventRole.INDUSTRY]: 150,
  [EventRole.INTERN]: 100,
  [EventRole.VOLUNTEER]: 50,

  // GVTEWAY Event Roles
  [EventRole.BACKSTAGE_L2]: 500,
  [EventRole.BACKSTAGE_L1]: 450,
  [EventRole.PLATINUM_VIP_L2]: 400,
  [EventRole.PLATINUM_VIP_L1]: 350,
  [EventRole.VIP_L3]: 300,
  [EventRole.VIP_L2]: 250,
  [EventRole.VIP_L1]: 200,
  [EventRole.GA_L5]: 150,
  [EventRole.GA_L4]: 120,
  [EventRole.GA_L3]: 100,
  [EventRole.GA_L2]: 80,
  [EventRole.GA_L1]: 60,
  [EventRole.GUEST]: 50,
  [EventRole.INFLUENCER]: 150,
  [EventRole.BRAND_AMBASSADOR]: 120,
  [EventRole.AFFILIATE]: 100,
};

// Event Role Platform Access
export const EVENT_ROLE_PLATFORM_ACCESS: Record<
  EventRole,
  ('atlvs' | 'compvss' | 'gvteway')[]
> = {
  // All Platform Access
  [EventRole.EXECUTIVE]: ['atlvs', 'compvss', 'gvteway'],
  [EventRole.CORE_AAA]: ['atlvs', 'compvss', 'gvteway'],
  [EventRole.AA]: ['atlvs', 'compvss', 'gvteway'],
  [EventRole.PRODUCTION]: ['atlvs', 'compvss', 'gvteway'],
  [EventRole.MANAGEMENT]: ['atlvs', 'compvss', 'gvteway'],

  // COMPVSS Only
  [EventRole.CREW]: ['compvss'],
  [EventRole.STAFF]: ['compvss'],
  [EventRole.VENDOR]: ['compvss'],
  [EventRole.AGENT]: ['compvss'],
  [EventRole.INDUSTRY]: ['compvss'],
  [EventRole.INTERN]: ['compvss'],
  [EventRole.VOLUNTEER]: ['compvss'],

  // COMPVSS + GVTEWAY
  [EventRole.ENTERTAINER]: ['compvss', 'gvteway'],
  [EventRole.ARTIST]: ['compvss', 'gvteway'],
  [EventRole.MEDIA]: ['compvss', 'gvteway'],
  [EventRole.SPONSOR]: ['compvss', 'gvteway'],
  [EventRole.PARTNER]: ['compvss', 'gvteway'],

  // GVTEWAY Only
  [EventRole.BACKSTAGE_L2]: ['gvteway'],
  [EventRole.BACKSTAGE_L1]: ['gvteway'],
  [EventRole.PLATINUM_VIP_L2]: ['gvteway'],
  [EventRole.PLATINUM_VIP_L1]: ['gvteway'],
  [EventRole.VIP_L3]: ['gvteway'],
  [EventRole.VIP_L2]: ['gvteway'],
  [EventRole.VIP_L1]: ['gvteway'],
  [EventRole.GA_L5]: ['gvteway'],
  [EventRole.GA_L4]: ['gvteway'],
  [EventRole.GA_L3]: ['gvteway'],
  [EventRole.GA_L2]: ['gvteway'],
  [EventRole.GA_L1]: ['gvteway'],
  [EventRole.GUEST]: ['gvteway'],
  [EventRole.INFLUENCER]: ['gvteway'],
  [EventRole.BRAND_AMBASSADOR]: ['gvteway'],
  [EventRole.AFFILIATE]: ['gvteway'],
};

// ============================================================================
// PERMISSION SYSTEM
// ============================================================================

export type Permission =
  // Event Management
  | 'events:create'
  | 'events:edit'
  | 'events:delete'
  | 'events:view'
  // Ticketing
  | 'tickets:manage'
  | 'orders:view'
  | 'orders:view:own'
  | 'orders:view:clients'
  | 'orders:refund'
  // Projects & Tasks
  | 'projects:create'
  | 'projects:edit'
  | 'projects:view'
  | 'tasks:assign'
  | 'tasks:view'
  // Budgets & Finance
  | 'budgets:manage'
  | 'budgets:view'
  // Advancing
  | 'advancing:submit'
  | 'advancing:approve'
  // Users
  | 'users:manage'
  // Venue Access
  | 'venue:access:all'
  | 'venue:access:restricted'
  | 'venue:access:production'
  | 'venue:access:management'
  | 'venue:access:crew'
  | 'venue:access:staff'
  | 'venue:access:vendor'
  | 'venue:access:performer'
  | 'venue:access:agent'
  | 'venue:access:media'
  | 'venue:access:sponsor'
  | 'venue:access:partner'
  | 'venue:access:industry'
  | 'venue:access:intern'
  | 'venue:access:volunteer'
  | 'venue:access:backstage'
  | 'venue:access:platinum_vip'
  | 'venue:access:vip'
  | 'venue:access:ga'
  | 'venue:access:guest'
  | 'venue:access:influencer'
  | 'venue:access:brand_ambassador'
  | 'venue:access:affiliate'
  // Special Access
  | 'backstage:access'
  | 'greenroom:access'
  | 'vip:lounge:access'
  | 'priority:entry'
  | 'photo:pit:access'
  // Referrals & Commissions
  | 'referral:create'
  | 'commission:view'
  | 'media:kit:access';

export const EVENT_ROLE_PERMISSIONS: Record<EventRole, Permission[]> = {
  [EventRole.EXECUTIVE]: [
    'events:create',
    'events:edit',
    'events:delete',
    'tickets:manage',
    'orders:view',
    'orders:refund',
    'advancing:submit',
    'advancing:approve',
    'projects:create',
    'projects:edit',
    'tasks:assign',
    'budgets:manage',
    'users:manage',
    'venue:access:all',
    'backstage:access',
  ],
  [EventRole.CORE_AAA]: [
    'events:create',
    'events:edit',
    'tickets:manage',
    'orders:view',
    'advancing:approve',
    'projects:create',
    'projects:edit',
    'tasks:assign',
    'budgets:manage',
    'venue:access:all',
    'backstage:access',
  ],
  [EventRole.AA]: [
    'events:edit',
    'tickets:manage',
    'orders:view',
    'advancing:submit',
    'projects:edit',
    'tasks:assign',
    'budgets:view',
    'venue:access:restricted',
    'backstage:access',
  ],
  [EventRole.PRODUCTION]: [
    'events:view',
    'advancing:submit',
    'projects:view',
    'tasks:view',
    'venue:access:production',
    'backstage:access',
  ],
  [EventRole.MANAGEMENT]: [
    'events:view',
    'orders:view',
    'projects:view',
    'budgets:view',
    'venue:access:management',
  ],
  [EventRole.CREW]: [
    'advancing:submit',
    'tasks:view',
    'venue:access:crew',
    'backstage:access',
  ],
  [EventRole.STAFF]: ['advancing:submit', 'tasks:view', 'venue:access:staff'],
  [EventRole.VENDOR]: [
    'advancing:submit',
    'orders:view:own',
    'venue:access:vendor',
  ],
  [EventRole.ENTERTAINER]: [
    'events:view',
    'venue:access:performer',
    'backstage:access',
    'greenroom:access',
  ],
  [EventRole.ARTIST]: [
    'events:view',
    'venue:access:performer',
    'backstage:access',
    'greenroom:access',
  ],
  [EventRole.AGENT]: [
    'events:view',
    'orders:view:clients',
    'venue:access:agent',
  ],
  [EventRole.MEDIA]: [
    'events:view',
    'venue:access:media',
    'photo:pit:access',
  ],
  [EventRole.SPONSOR]: ['events:view', 'venue:access:sponsor'],
  [EventRole.PARTNER]: ['events:view', 'venue:access:partner'],
  [EventRole.INDUSTRY]: ['events:view', 'venue:access:industry'],
  [EventRole.INTERN]: ['tasks:view', 'venue:access:intern'],
  [EventRole.VOLUNTEER]: ['tasks:view', 'venue:access:volunteer'],
  [EventRole.BACKSTAGE_L2]: [
    'events:view',
    'orders:view:own',
    'venue:access:backstage',
    'backstage:access',
    'greenroom:access',
    'vip:lounge:access',
  ],
  [EventRole.BACKSTAGE_L1]: [
    'events:view',
    'orders:view:own',
    'venue:access:backstage',
    'backstage:access',
  ],
  [EventRole.PLATINUM_VIP_L2]: [
    'events:view',
    'orders:view:own',
    'venue:access:platinum_vip',
    'vip:lounge:access',
    'priority:entry',
  ],
  [EventRole.PLATINUM_VIP_L1]: [
    'events:view',
    'orders:view:own',
    'venue:access:platinum_vip',
    'vip:lounge:access',
  ],
  [EventRole.VIP_L3]: [
    'events:view',
    'orders:view:own',
    'venue:access:vip',
    'vip:lounge:access',
  ],
  [EventRole.VIP_L2]: ['events:view', 'orders:view:own', 'venue:access:vip'],
  [EventRole.VIP_L1]: ['events:view', 'orders:view:own', 'venue:access:vip'],
  [EventRole.GA_L5]: [
    'events:view',
    'orders:view:own',
    'venue:access:ga',
    'priority:entry',
  ],
  [EventRole.GA_L4]: ['events:view', 'orders:view:own', 'venue:access:ga'],
  [EventRole.GA_L3]: ['events:view', 'orders:view:own', 'venue:access:ga'],
  [EventRole.GA_L2]: ['events:view', 'orders:view:own', 'venue:access:ga'],
  [EventRole.GA_L1]: ['events:view', 'orders:view:own', 'venue:access:ga'],
  [EventRole.GUEST]: ['events:view', 'venue:access:guest'],
  [EventRole.INFLUENCER]: [
    'events:view',
    'orders:view:own',
    'venue:access:influencer',
    'media:kit:access',
  ],
  [EventRole.BRAND_AMBASSADOR]: [
    'events:view',
    'orders:view:own',
    'venue:access:brand_ambassador',
    'referral:create',
  ],
  [EventRole.AFFILIATE]: [
    'events:view',
    'orders:view:own',
    'venue:access:affiliate',
    'referral:create',
    'commission:view',
  ],
};

// ============================================================================
// ROLE UTILITIES
// ============================================================================

export function isLegendRole(role: PlatformRole): boolean {
  return role.startsWith('LEGEND_');
}

export function hasEventRolePlatformAccess(
  role: EventRole,
  platform: 'atlvs' | 'compvss' | 'gvteway'
): boolean {
  return EVENT_ROLE_PLATFORM_ACCESS[role].includes(platform);
}

export function getEventRolePermissions(role: EventRole): Permission[] {
  return EVENT_ROLE_PERMISSIONS[role] || [];
}

export function getAllInheritedRoles(
  role: PlatformRole
): PlatformRole[] {
  const inherited: PlatformRole[] = [];
  let currentRole: PlatformRole | undefined = role;

  while (currentRole) {
    const metadata: any = PLATFORM_ROLE_METADATA[currentRole];
    if (metadata.inheritsFrom) {
      inherited.push(metadata.inheritsFrom);
      currentRole = metadata.inheritsFrom;
    } else {
      break;
    }
  }

  return inherited;
}

export function hasPermission(
  role: PlatformRole,
  permission: string
): boolean {
  // Legend roles have all permissions
  if (isLegendRole(role)) {
    return true;
  }

  // Check inherited roles
  const inherited = getAllInheritedRoles(role);
  for (const inheritedRole of inherited) {
    if (isLegendRole(inheritedRole)) {
      return true;
    }
  }

  return false;
}
