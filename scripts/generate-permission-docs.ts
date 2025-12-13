#!/usr/bin/env npx ts-node

/**
 * Gap 11 Remediation: Auto-Generated Permission Documentation
 * Generates comprehensive documentation for all roles and permissions
 */

import * as fs from 'fs';
import * as path from 'path';

// Import role definitions
import {
  PlatformRole,
  PLATFORM_ROLE_METADATA,
  RoleLevel,
} from '../packages/config/roles';

// ============================================================================
// TYPES
// ============================================================================

interface RoleDocumentation {
  role: PlatformRole;
  displayName: string;
  description: string;
  level: RoleLevel;
  app: string;
  permissions: string[];
  inheritsFrom: PlatformRole[];
  canManage: PlatformRole[];
}

interface AppDocumentation {
  name: string;
  description: string;
  roles: RoleDocumentation[];
}

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

const ROLE_PERMISSIONS: Record<PlatformRole, string[]> = {
  // Legend Roles
  [PlatformRole.LEGEND_SUPER_ADMIN]: [
    'Full system access across all applications',
    'Manage all users and roles',
    'Access audit logs and security settings',
    'Configure system-wide settings',
    'Manage billing and subscriptions',
    'Delete any data permanently',
  ],
  [PlatformRole.LEGEND_ADMIN]: [
    'Cross-application administration',
    'Manage users within organizations',
    'View audit logs',
    'Configure organization settings',
  ],
  [PlatformRole.LEGEND_DEVELOPER]: [
    'Access developer tools and APIs',
    'View system logs and metrics',
    'Test features in sandbox mode',
    'Access documentation and SDKs',
  ],
  [PlatformRole.LEGEND_COLLABORATOR]: [
    'Cross-application collaboration',
    'View shared resources',
    'Comment and annotate',
  ],
  [PlatformRole.LEGEND_SUPPORT]: [
    'Access support tools',
    'View user accounts (read-only)',
    'Manage support tickets',
    'Access knowledge base',
  ],
  [PlatformRole.LEGEND_INCOGNITO]: [
    'Anonymous browsing mode',
    'View public content only',
    'No audit trail',
  ],

  // ATLVS Roles
  [PlatformRole.ATLVS_SUPER_ADMIN]: [
    'Full ATLVS application access',
    'Manage all ATLVS users and roles',
    'Configure ATLVS settings',
    'Access financial reports',
    'Manage integrations',
  ],
  [PlatformRole.ATLVS_ADMIN]: [
    'Manage ATLVS users',
    'Configure organization settings',
    'View all reports',
    'Manage budgets and expenses',
  ],
  [PlatformRole.ATLVS_TEAM_MEMBER]: [
    'Create and manage productions',
    'Manage budgets and expenses',
    'View reports',
    'Collaborate on projects',
  ],
  [PlatformRole.ATLVS_VIEWER]: [
    'View productions and projects',
    'View budgets (read-only)',
    'View reports (read-only)',
  ],

  // COMPVSS Roles
  [PlatformRole.COMPVSS_ADMIN]: [
    'Full COMPVSS application access',
    'Manage all COMPVSS users',
    'Configure production settings',
    'Manage schedules and resources',
  ],
  [PlatformRole.COMPVSS_TEAM_MEMBER]: [
    'Manage assigned productions',
    'Update schedules',
    'Manage crew and resources',
    'Submit reports',
  ],
  [PlatformRole.COMPVSS_COLLABORATOR]: [
    'View assigned productions',
    'Update task status',
    'Submit time entries',
    'View schedules',
  ],
  [PlatformRole.COMPVSS_VIEWER]: [
    'View productions (read-only)',
    'View schedules (read-only)',
    'View public documents',
  ],

  // GVTEWAY Roles
  [PlatformRole.GVTEWAY_ADMIN]: [
    'Full GVTEWAY application access',
    'Manage all events and venues',
    'Configure ticketing settings',
    'Access analytics',
  ],
  [PlatformRole.GVTEWAY_EXPERIENCE_CREATOR]: [
    'Create and manage experiences',
    'Configure ticket types',
    'Manage event content',
    'View sales reports',
  ],
  [PlatformRole.GVTEWAY_VENUE_MANAGER]: [
    'Manage venue settings',
    'Configure seating charts',
    'Manage venue staff',
    'View venue analytics',
  ],
  [PlatformRole.GVTEWAY_ARTIST_VERIFIED]: [
    'Manage artist profile',
    'View performance analytics',
    'Access artist tools',
    'Verified badge display',
  ],
  [PlatformRole.GVTEWAY_ARTIST]: [
    'Manage artist profile',
    'View basic analytics',
    'Submit for verification',
  ],
  [PlatformRole.GVTEWAY_MEMBER_EXTRA]: [
    'All Plus features',
    'Exclusive early access',
    'VIP support',
    'Special discounts',
  ],
  [PlatformRole.GVTEWAY_MEMBER_PLUS]: [
    'All Member features',
    'Priority booking',
    'Member discounts',
    'Exclusive content',
  ],
  [PlatformRole.GVTEWAY_MEMBER]: [
    'Purchase tickets',
    'Save favorites',
    'View order history',
    'Receive notifications',
  ],
  [PlatformRole.GVTEWAY_MEMBER_GUEST]: [
    'Browse events',
    'View public content',
    'Limited purchases',
  ],
  [PlatformRole.GVTEWAY_AFFILIATE]: [
    'Access affiliate dashboard',
    'Generate referral links',
    'View commission reports',
    'Manage payouts',
  ],
  [PlatformRole.GVTEWAY_MODERATOR]: [
    'Moderate user content',
    'Manage reports',
    'Ban/suspend users',
    'View moderation logs',
  ],
};

// ============================================================================
// DOCUMENTATION GENERATOR
// ============================================================================

function generateRoleDocumentation(role: PlatformRole): RoleDocumentation {
  const metadata = PLATFORM_ROLE_METADATA[role];
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  // Determine app from role name
  let app = 'Platform';
  if (role.startsWith('LEGEND_')) app = 'Legend (Cross-Platform)';
  else if (role.startsWith('ATLVS_')) app = 'ATLVS';
  else if (role.startsWith('COMPVSS_')) app = 'COMPVSS';
  else if (role.startsWith('GVTEWAY_')) app = 'GVTEWAY';

  // Format display name from role
  const displayName = role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return {
    role,
    displayName,
    description: metadata?.description || '',
    level: metadata?.level || 'viewer',
    app,
    permissions,
    inheritsFrom: [],
    canManage: [],
  };
}

function generateAppDocumentation(): AppDocumentation[] {
  const apps: AppDocumentation[] = [];

  // Group roles by app
  const appGroups: Record<string, PlatformRole[]> = {
    'Legend (Cross-Platform)': [],
    'ATLVS': [],
    'COMPVSS': [],
    'GVTEWAY': [],
  };

  Object.values(PlatformRole).forEach(role => {
    if (role.startsWith('LEGEND_')) appGroups['Legend (Cross-Platform)'].push(role);
    else if (role.startsWith('ATLVS_')) appGroups['ATLVS'].push(role);
    else if (role.startsWith('COMPVSS_')) appGroups['COMPVSS'].push(role);
    else if (role.startsWith('GVTEWAY_')) appGroups['GVTEWAY'].push(role);
  });

  const appDescriptions: Record<string, string> = {
    'Legend (Cross-Platform)': 'Platform-wide roles with access across all applications',
    'ATLVS': 'Business operations and financial management application',
    'COMPVSS': 'Production and event operations management',
    'GVTEWAY': 'Ticketing and fan experience platform',
  };

  Object.entries(appGroups).forEach(([appName, roles]) => {
    apps.push({
      name: appName,
      description: appDescriptions[appName] || '',
      roles: roles.map(generateRoleDocumentation),
    });
  });

  return apps;
}

function generateMarkdown(apps: AppDocumentation[]): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString();

  lines.push('# GHXSTSHIP Platform Permissions Documentation');
  lines.push('');
  lines.push(`> Auto-generated on ${timestamp}`);
  lines.push('');
  lines.push('## Table of Contents');
  lines.push('');
  
  apps.forEach((app, index) => {
    lines.push(`${index + 1}. [${app.name}](#${app.name.toLowerCase().replace(/[^a-z0-9]/g, '-')})`);
  });
  
  lines.push('');
  lines.push('---');
  lines.push('');

  // Role Level Legend
  lines.push('## Role Levels');
  lines.push('');
  lines.push('| Level | Description |');
  lines.push('|-------|-------------|');
  lines.push('| **god** | Platform-wide super administrator access |');
  lines.push('| **admin** | Full administrative access within scope |');
  lines.push('| **manager** | Management access with limited admin capabilities |');
  lines.push('| **member** | Standard user access with create/edit permissions |');
  lines.push('| **viewer** | Read-only access |');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Generate documentation for each app
  apps.forEach(app => {
    lines.push(`## ${app.name}`);
    lines.push('');
    lines.push(app.description);
    lines.push('');

    app.roles.forEach(role => {
      lines.push(`### ${role.displayName}`);
      lines.push('');
      lines.push(`**Role ID:** \`${role.role}\``);
      lines.push('');
      lines.push(`**Level:** ${role.level}`);
      lines.push('');
      
      if (role.description) {
        lines.push(`**Description:** ${role.description}`);
        lines.push('');
      }

      lines.push('**Permissions:**');
      lines.push('');
      role.permissions.forEach(perm => {
        lines.push(`- ${perm}`);
      });
      lines.push('');

      if (role.inheritsFrom.length > 0) {
        lines.push('**Inherits From:**');
        lines.push('');
        role.inheritsFrom.forEach(r => {
          lines.push(`- \`${r}\``);
        });
        lines.push('');
      }

      if (role.canManage.length > 0) {
        lines.push('**Can Manage:**');
        lines.push('');
        role.canManage.forEach(r => {
          lines.push(`- \`${r}\``);
        });
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    });
  });

  // Add footer
  lines.push('## Notes');
  lines.push('');
  lines.push('- Permissions are cumulative based on role hierarchy');
  lines.push('- Legend roles have cross-application access');
  lines.push('- Users can have multiple roles assigned');
  lines.push('- Role changes are logged in the audit trail');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*This documentation is auto-generated. Do not edit manually.*');

  return lines.join('\n');
}

function generateJSON(apps: AppDocumentation[]): string {
  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    applications: apps,
  }, null, 2);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('Generating permission documentation...');

  const apps = generateAppDocumentation();
  
  // Generate Markdown
  const markdown = generateMarkdown(apps);
  const mdPath = path.join(__dirname, '..', 'docs', 'PERMISSIONS.md');
  fs.mkdirSync(path.dirname(mdPath), { recursive: true });
  fs.writeFileSync(mdPath, markdown);
  console.log(`Generated: ${mdPath}`);

  // Generate JSON
  const json = generateJSON(apps);
  const jsonPath = path.join(__dirname, '..', 'docs', 'permissions.json');
  fs.writeFileSync(jsonPath, json);
  console.log(`Generated: ${jsonPath}`);

  console.log('Permission documentation generated successfully!');
}

main().catch(console.error);
