export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
  displayName: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
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
    const validated = profileSchema.parse(body);

    // Update platform_users
    const { error: platformError } = await supabase
      .from('platform_users')
      .update({
        full_name: `${validated.firstName} ${validated.lastName}`,
        avatar_url: validated.avatarUrl || null,
      })
      .eq('auth_user_id', user.id);

    if (platformError) {
      logger.error('Platform user update error:', platformError);
    }

    // Update profiles
    const { error: profileError } = await supabase
      .from('platform_users')
      .update({
        first_name: validated.firstName,
        last_name: validated.lastName,
        display_name: validated.displayName || `${validated.firstName} ${validated.lastName}`,
        phone: validated.phone || null,
        bio: validated.bio || null,
        avatar_url: validated.avatarUrl || null,
        onboarding_step: 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      logger.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, step: 'profile' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
