#!/usr/bin/env npx tsx
/**
 * Seed Demo Users Script
 * Creates demo users in Supabase Auth for testing each role on each platform
 * 
 * Usage: npx tsx scripts/seed-demo-users.ts
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
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

// Demo user definitions
const DEMO_USERS = [
  // ATLVS Users
  {
    id: '10000000-0000-0000-0001-000000000001',
    email: 'atlvs.superadmin@demo.ghxstship.com',
    full_name: 'Atlas SuperAdmin',
    role: 'ATLVS_SUPER_ADMIN',
    platform: 'atlvs',
  },
  {
    id: '10000000-0000-0000-0001-000000000002',
    email: 'atlvs.admin@demo.ghxstship.com',
    full_name: 'Atlas Admin',
    role: 'ATLVS_ADMIN',
    platform: 'atlvs',
  },
  {
    id: '10000000-0000-0000-0001-000000000003',
    email: 'atlvs.team@demo.ghxstship.com',
    full_name: 'Atlas TeamMember',
    role: 'ATLVS_TEAM_MEMBER',
    platform: 'atlvs',
  },
  {
    id: '10000000-0000-0000-0001-000000000004',
    email: 'atlvs.viewer@demo.ghxstship.com',
    full_name: 'Atlas Viewer',
    role: 'ATLVS_VIEWER',
    platform: 'atlvs',
  },

  // COMPVSS Users
  {
    id: '10000000-0000-0000-0002-000000000001',
    email: 'compvss.admin@demo.ghxstship.com',
    full_name: 'Compass Admin',
    role: 'COMPVSS_ADMIN',
    platform: 'compvss',
  },
  {
    id: '10000000-0000-0000-0002-000000000002',
    email: 'compvss.team@demo.ghxstship.com',
    full_name: 'Compass TeamMember',
    role: 'COMPVSS_TEAM_MEMBER',
    platform: 'compvss',
  },
  {
    id: '10000000-0000-0000-0002-000000000003',
    email: 'compvss.collab@demo.ghxstship.com',
    full_name: 'Compass Collaborator',
    role: 'COMPVSS_COLLABORATOR',
    platform: 'compvss',
  },
  {
    id: '10000000-0000-0000-0002-000000000004',
    email: 'compvss.viewer@demo.ghxstship.com',
    full_name: 'Compass Viewer',
    role: 'COMPVSS_VIEWER',
    platform: 'compvss',
  },

  // GVTEWAY Users
  {
    id: '10000000-0000-0000-0003-000000000001',
    email: 'gvteway.admin@demo.ghxstship.com',
    full_name: 'Gateway Admin',
    role: 'GVTEWAY_ADMIN',
    platform: 'gvteway',
  },
  {
    id: '10000000-0000-0000-0003-000000000002',
    email: 'gvteway.creator@demo.ghxstship.com',
    full_name: 'Gateway Creator',
    role: 'GVTEWAY_EXPERIENCE_CREATOR',
    platform: 'gvteway',
  },
  {
    id: '10000000-0000-0000-0003-000000000003',
    email: 'gvteway.venue@demo.ghxstship.com',
    full_name: 'Gateway VenueManager',
    role: 'GVTEWAY_VENUE_MANAGER',
    platform: 'gvteway',
  },
  {
    id: '10000000-0000-0000-0003-000000000004',
    email: 'gvteway.artist@demo.ghxstship.com',
    full_name: 'Gateway Artist',
    role: 'GVTEWAY_ARTIST_VERIFIED',
    platform: 'gvteway',
  },
  {
    id: '10000000-0000-0000-0003-000000000005',
    email: 'gvteway.member@demo.ghxstship.com',
    full_name: 'Gateway Member',
    role: 'GVTEWAY_MEMBER_PLUS',
    platform: 'gvteway',
  },
  {
    id: '10000000-0000-0000-0003-000000000006',
    email: 'gvteway.affiliate@demo.ghxstship.com',
    full_name: 'Gateway Affiliate',
    role: 'GVTEWAY_AFFILIATE',
    platform: 'gvteway',
  },

  // Legend (God Mode) Users
  {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'legend.super@demo.ghxstship.com',
    full_name: 'Legend SuperAdmin',
    role: 'LEGEND_SUPER_ADMIN',
    platform: 'legend',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    email: 'legend.dev@demo.ghxstship.com',
    full_name: 'Legend Developer',
    role: 'LEGEND_DEVELOPER',
    platform: 'legend',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    email: 'legend.support@demo.ghxstship.com',
    full_name: 'Legend Support',
    role: 'LEGEND_SUPPORT',
    platform: 'legend',
  },
];

async function seedDemoUsers() {
  console.log('🚀 Seeding demo users...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of DEMO_USERS) {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === user.email);

      if (existingUser) {
        console.log(`⏭️  Skipping ${user.email} (already exists)`);
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
        console.error(`❌ Error creating ${user.email}:`, error.message);
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
        console.error(`⚠️  Platform user error for ${user.email}:`, platformError.message);
      }

      console.log(`✅ Created ${user.email} (${user.role})`);
      created++;
    } catch (err) {
      console.error(`❌ Unexpected error for ${user.email}:`, err);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n🔑 Password for all demo accounts: ${DEMO_PASSWORD}`);
}

seedDemoUsers().catch(console.error);
