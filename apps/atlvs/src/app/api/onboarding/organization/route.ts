export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const organizationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['production_company', 'venue', 'agency', 'promoter', 'other']).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.enum(['1', '2-10', '11-50', '51-200', '200+']).optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = organizationSchema.parse(body);

    // Get platform user
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or update organization
    let organizationId = platformUser.organization_id;

    if (!organizationId) {
      // Create new organization
      const slug = validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: validated.name,
          slug: `${slug}-${Date.now()}`,
          timezone: 'America/New_York',
        })
        .select()
        .single();

      if (orgError) {
        logger.error('Organization creation error:', orgError);
        return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
      }

      organizationId = newOrg.id;

      // Update platform user with organization
      await supabase
        .from('platform_users')
        .update({ organization_id: organizationId })
        .eq('id', platformUser.id);
    }

    // Update profile with organization info
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        metadata: {
          organization_type: validated.type,
          organization_role: validated.role,
          team_size: validated.teamSize,
        },
        onboarding_step: 2,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      logger.error('Profile update error:', profileError);
    }

    return NextResponse.json({ 
      success: true, 
      step: 'organization',
      organizationId 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Organization update error:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}
