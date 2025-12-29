export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { handleDealToProjectHandoff } from '@ghxstship/config/supabase-integration';
import { z } from 'zod';

const dealToProjectSchema = z.object({
  dealId: z.string().uuid(),
  orgSlug: z.string().min(1),
  autoCreateProject: z.boolean().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = dealToProjectSchema.parse(body);

    const result = await handleDealToProjectHandoff({
      dealId: validatedData.dealId,
      orgSlug: validatedData.orgSlug,
      autoCreateProject: validatedData.autoCreateProject ?? true,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Deal to project handoff API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
