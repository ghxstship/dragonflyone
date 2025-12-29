export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { syncProjectToEvent } from '@ghxstship/config/supabase-integration';
import { z } from 'zod';

const syncProjectSchema = z.object({
  projectId: z.string().uuid(),
  orgSlug: z.string().min(1),
  eventData: z.record(z.unknown()).optional(),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = syncProjectSchema.parse(body);
    const { projectId, orgSlug, eventData } = validatedData;

    const result = await syncProjectToEvent({
      projectId,
      orgSlug,
      eventData: eventData || {},
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Project to event sync API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
