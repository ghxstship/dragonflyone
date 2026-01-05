export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      status: {
        online: true,
        last_sync: new Date().toISOString(),
        pending_sync_count: 0,
        storage_used_mb: 0,
        storage_limit_mb: 100,
        cached_events: [],
        cached_credentials: 0,
        cached_crew: 0 } });
  } catch (error) {
    logger.error('Error in GET /api/offline/status:', error instanceof Error ? error : undefined);
    return NextResponse.json({
      status: {
        online: false,
        last_sync: null,
        pending_sync_count: 0,
        storage_used_mb: 0,
        storage_limit_mb: 100,
        cached_events: [],
        cached_credentials: 0,
        cached_crew: 0 } });
  }
}
