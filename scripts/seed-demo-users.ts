#!/usr/bin/env npx tsx
/**
 * Seed Demo Users Script
 * Creates demo users in Supabase Auth for testing EVERY role on each platform
 * 
 * Usage: 
 *   npx tsx scripts/seed-demo-users.ts          # Create users (skip existing)
 *   npx tsx scripts/seed-demo-users.ts --reset  # Delete and recreate all demo users
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables:');
  console.error('   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Demo password for all accounts
const DEMO_PASSWORD = 'Demo123!';

// Demo domain for all accounts
const DEMO_DOMAIN = 'demo.ghxstship.com';

// Complete demo user definitions - ONE USER PER PLATFORM ROLE
const DEMO_USERS = [
  // ============================================================================
  // LEGEND ROLES (God Mode) - 6 roles
  // ============================================================================
  {
    id: '10000000-0000-0000-0000-000000000001',
    email: `legend.super@${DEMO_DOMAIN}`,
    full_name: 'Legend SuperAdmin',
    role: 'LEGEND_SUPER_ADMIN',
    platform: 'legend',
    description: 'Absolute platform control across all systems',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    email: `legend.admin@${DEMO_DOMAIN}`,
    full_name: 'Legend Admin',
    role: 'LEGEND_ADMIN',
    platform: 'legend',
    description: 'Internal product management with cross-app access',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    email: `legend.dev@${DEMO_DOMAIN}`,
    full_name: 'Legend Developer',
    role: 'LEGEND_DEVELOPER',
    platform: 'legend',
    description: 'Full repository access, internal product team',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    email: `legend.collab@${DEMO_DOMAIN}`,
    full_name: 'Legend Collaborator',
    role: 'LEGEND_COLLABORATOR',
    platform: 'legend',
    description: 'External scoped full repo access',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    email: `legend.support@${DEMO_DOMAIN}`,
    full_name: 'Legend Support',
    role: 'LEGEND_SUPPORT',
    platform: 'legend',
    description: 'Tech support with conditional user impersonation',
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    email: `legend.incognito@${DEMO_DOMAIN}`,
    full_name: 'Legend Incognito',
    role: 'LEGEND_INCOGNITO',
    platform: 'legend',
    description: 'Stealth mode operations with unrestricted impersonation',
  },

  // ============================================================================
  // ATLVS ROLES (Business Operations) - 4 roles
  // ============================================================================
  {
    id: '10000000-0000-0000-0001-000000000001',
    email: `atlvs.superadmin@${DEMO_DOMAIN}`,
    full_name: 'Atlas SuperAdmin',
    role: 'ATLVS_SUPER_ADMIN',
    platform: 'atlvs',
    description: 'Full system administration and configuration',
  },
  {
    id: '10000000-0000-0000-0001-000000000002',
    email: `atlvs.admin@${DEMO_DOMAIN}`,
    full_name: 'Atlas Admin',
    role: 'ATLVS_ADMIN',
    platform: 'atlvs',
    description: 'Administrative access to business operations',
  },
  {
    id: '10000000-0000-0000-0001-000000000003',
    email: `atlvs.team@${DEMO_DOMAIN}`,
    full_name: 'Atlas TeamMember',
    role: 'ATLVS_TEAM_MEMBER',
    platform: 'atlvs',
    description: 'Work on assigned tasks and projects',
  },
  {
    id: '10000000-0000-0000-0001-000000000004',
    email: `atlvs.viewer@${DEMO_DOMAIN}`,
    full_name: 'Atlas Viewer',
    role: 'ATLVS_VIEWER',
    platform: 'atlvs',
    description: 'Read-only access to business data',
  },

  // ============================================================================
  // COMPVSS ROLES (Production Management) - 4 roles
  // ============================================================================
  {
    id: '10000000-0000-0000-0002-000000000001',
    email: `compvss.admin@${DEMO_DOMAIN}`,
    full_name: 'Compass Admin',
    role: 'COMPVSS_ADMIN',
    platform: 'compvss',
    description: 'Full administrative access to production operations',
  },
  {
    id: '10000000-0000-0000-0002-000000000002',
    email: `compvss.team@${DEMO_DOMAIN}`,
    full_name: 'Compass TeamMember',
    role: 'COMPVSS_TEAM_MEMBER',
    platform: 'compvss',
    description: 'Work on assigned events and productions',
  },
  {
    id: '10000000-0000-0000-0002-000000000003',
    email: `compvss.collab@${DEMO_DOMAIN}`,
    full_name: 'Compass Collaborator',
    role: 'COMPVSS_COLLABORATOR',
    platform: 'compvss',
    description: 'Limited event access for external collaborators',
  },
  {
    id: '10000000-0000-0000-0002-000000000004',
    email: `compvss.viewer@${DEMO_DOMAIN}`,
    full_name: 'Compass Viewer',
    role: 'COMPVSS_VIEWER',
    platform: 'compvss',
    description: 'Read-only access to production data',
  },

  // ============================================================================
  // GVTEWAY ROLES (Fan Experience) - 11 roles
  // ============================================================================
  {
    id: '10000000-0000-0000-0003-000000000001',
    email: `gvteway.admin@${DEMO_DOMAIN}`,
    full_name: 'Gateway Admin',
    role: 'GVTEWAY_ADMIN',
    platform: 'gvteway',
    description: 'Full platform administration',
  },
  {
    id: '10000000-0000-0000-0003-000000000002',
    email: `gvteway.creator@${DEMO_DOMAIN}`,
    full_name: 'Gateway Creator',
    role: 'GVTEWAY_EXPERIENCE_CREATOR',
    platform: 'gvteway',
    description: 'Create and manage experiences/events',
  },
  {
    id: '10000000-0000-0000-0003-000000000003',
    email: `gvteway.venue@${DEMO_DOMAIN}`,
    full_name: 'Gateway VenueManager',
    role: 'GVTEWAY_VENUE_MANAGER',
    platform: 'gvteway',
    description: 'Manage venue profiles and operations',
  },
  {
    id: '10000000-0000-0000-0003-000000000004',
    email: `gvteway.moderator@${DEMO_DOMAIN}`,
    full_name: 'Gateway Moderator',
    role: 'GVTEWAY_MODERATOR',
    platform: 'gvteway',
    description: 'Content moderation and community management',
  },
  {
    id: '10000000-0000-0000-0003-000000000005',
    email: `gvteway.artist.verified@${DEMO_DOMAIN}`,
    full_name: 'Gateway VerifiedArtist',
    role: 'GVTEWAY_ARTIST_VERIFIED',
    platform: 'gvteway',
    description: 'Verified artist with enhanced features',
  },
  {
    id: '10000000-0000-0000-0003-000000000006',
    email: `gvteway.artist@${DEMO_DOMAIN}`,
    full_name: 'Gateway Artist',
    role: 'GVTEWAY_ARTIST',
    platform: 'gvteway',
    description: 'Artist profile and fan engagement',
  },
  {
    id: '10000000-0000-0000-0003-000000000007',
    email: `gvteway.member.extra@${DEMO_DOMAIN}`,
    full_name: 'Gateway MemberExtra',
    role: 'GVTEWAY_MEMBER_EXTRA',
    platform: 'gvteway',
    description: 'Premium membership with exclusive benefits',
  },
  {
    id: '10000000-0000-0000-0003-000000000008',
    email: `gvteway.member.plus@${DEMO_DOMAIN}`,
    full_name: 'Gateway MemberPlus',
    role: 'GVTEWAY_MEMBER_PLUS',
    platform: 'gvteway',
    description: 'Enhanced membership with early access',
  },
  {
    id: '10000000-0000-0000-0003-000000000009',
    email: `gvteway.member@${DEMO_DOMAIN}`,
    full_name: 'Gateway Member',
    role: 'GVTEWAY_MEMBER',
    platform: 'gvteway',
    description: 'Standard member access',
  },
  {
    id: '10000000-0000-0000-0003-000000000010',
    email: `gvteway.guest@${DEMO_DOMAIN}`,
    full_name: 'Gateway Guest',
    role: 'GVTEWAY_MEMBER_GUEST',
    platform: 'gvteway',
    description: 'Temporary guest access',
  },
  {
    id: '10000000-0000-0000-0003-000000000011',
    email: `gvteway.affiliate@${DEMO_DOMAIN}`,
    full_name: 'Gateway Affiliate',
    role: 'GVTEWAY_AFFILIATE',
    platform: 'gvteway',
    description: 'Affiliate marketing and referrals',
  },
];

// Check for --reset flag
const isReset = process.argv.includes('--reset');

async function deleteDemoUsers() {
  // eslint-disable-next-line no-console
  console.log('Deleting existing demo users...\n');
  
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const demoEmails = DEMO_USERS.map(u => u.email);
  
  for (const authUser of existingUsers?.users || []) {
    if (authUser.email && demoEmails.includes(authUser.email)) {
      // Delete from user_roles first
      await supabase.from('user_roles').delete().eq('platform_user_id', 
        DEMO_USERS.find(u => u.email === authUser.email)?.id
      );
      
      // Delete from platform_users
      await supabase.from('platform_users').delete().eq('auth_user_id', authUser.id);
      
      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(authUser.id);
      if (error) {
        // eslint-disable-next-line no-console
        console.error(`  Failed to delete ${authUser.email}:`, error.message);
      } else {
        // eslint-disable-next-line no-console
        console.log(`  Deleted ${authUser.email}`);
      }
    }
  }
  // eslint-disable-next-line no-console
  console.log('');
}

async function seedDemoUsers() {
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('DEMO USER SEEDING SCRIPT');
  // eslint-disable-next-line no-console
  console.log(`Target: ${SUPABASE_URL}`);
  // eslint-disable-next-line no-console
  console.log(`Mode: ${isReset ? 'RESET (delete + recreate)' : 'CREATE (skip existing)'}`);
  // eslint-disable-next-line no-console
  console.log(`Total users to seed: ${DEMO_USERS.length}`);
  // eslint-disable-next-line no-console
  console.log('='.repeat(60) + '\n');

  // If reset mode, delete existing users first
  if (isReset) {
    await deleteDemoUsers();
  }

  // Get existing users once (more efficient)
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingEmails = new Set(existingUsers?.users?.map(u => u.email) || []);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Group users by platform for organized output
  const platforms = ['legend', 'atlvs', 'compvss', 'gvteway'];
  
  for (const platform of platforms) {
    const platformUsers = DEMO_USERS.filter(u => u.platform === platform);
    // eslint-disable-next-line no-console
    console.log(`\n${platform.toUpperCase()} (${platformUsers.length} roles):`);
    // eslint-disable-next-line no-console
    console.log('-'.repeat(40));
    
    for (const user of platformUsers) {
      try {
        if (existingEmails.has(user.email)) {
          // eslint-disable-next-line no-console
          console.log(`  [SKIP] ${user.email}`);
          skipped++;
          continue;
        }

        // Create auth user
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
          },
          app_metadata: {
            platform: user.platform,
            role: user.role,
          },
        });

        if (error) {
          // eslint-disable-next-line no-console
          console.error(`  [FAIL] ${user.email}: ${error.message}`);
          errors++;
          continue;
        }

        // Create platform_users record
        const { error: platformError } = await supabase.from('platform_users').upsert({
          id: user.id,
          auth_user_id: data.user.id,
          organization_id: '00000000-0000-0000-0000-000000000001',
          email: user.email,
          full_name: user.full_name,
        }, {
          onConflict: 'auth_user_id',
        });

        // Create user_roles record
        if (!platformError) {
          await supabase.from('user_roles').upsert({
            platform_user_id: user.id,
            organization_id: '00000000-0000-0000-0000-000000000001',
            role_code: user.role,
          }, {
            onConflict: 'platform_user_id,organization_id,role_code',
          });
        }

        if (platformError) {
          // eslint-disable-next-line no-console
          console.warn(`  [WARN] ${user.email}: platform_users error - ${platformError.message}`);
        }

        // eslint-disable-next-line no-console
        console.log(`  [OK]   ${user.email} (${user.role})`);
        created++;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`  [FAIL] ${user.email}:`, err);
        errors++;
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log('\n' + '='.repeat(60));
  // eslint-disable-next-line no-console
  console.log('SUMMARY');
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));
  // eslint-disable-next-line no-console
  console.log(`  Created: ${created}`);
  // eslint-disable-next-line no-console
  console.log(`  Skipped: ${skipped}`);
  // eslint-disable-next-line no-console
  console.log(`  Errors:  ${errors}`);
  // eslint-disable-next-line no-console
  console.log(`  Total:   ${DEMO_USERS.length}`);
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('PASSWORD FOR ALL DEMO ACCOUNTS: ' + DEMO_PASSWORD);
  // eslint-disable-next-line no-console
  console.log('='.repeat(60));
}

seedDemoUsers().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Script failed:', err);
  process.exit(1);
});
