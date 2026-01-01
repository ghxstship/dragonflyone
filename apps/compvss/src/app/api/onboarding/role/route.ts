export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.string().min(1),
  additionalRoles: z.array(z.string()).optional(),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
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
    const validated = roleSchema.parse(body);

    const { error: profileError } = await supabase
      .from('platform_users')
      .update({
        metadata: {
          selected_role: validated.role,
          additional_roles: validated.additionalRoles || [],
        },
        onboarding_step: 3,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      logger.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true, step: 'role' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Role update error:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
