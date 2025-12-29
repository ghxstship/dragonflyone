export const dynamic = 'force-dynamic';

import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/kpi/reports/favorites
 * Get all KPI reports favorited by the current user
 */
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET() {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get favorited report IDs
    const { data: favorites, error: favError } = await supabase
      .from('kpi_report_favorites')
      .select('report_id')
      .eq('user_id', user.id);

    if (favError) throw favError;

    const favoritesData = favorites as { report_id: string }[] | null;

    if (!favoritesData || favoritesData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      });
    }

    // Get the actual reports
    const reportIds = favoritesData.map(f => f.report_id);
    const { data: reports, error: reportsError } = await supabase
      .from('kpi_reports')
      .select('*')
      .in('id', reportIds)
      .order('name');

    if (reportsError) throw reportsError;

    // Mark all as favorited
    const reportsArray = reports as Record<string, unknown>[] | null;
    const reportsWithFavorite = (reportsArray || []).map(report => ({
      ...report,
      is_favorited: true
    }));

    return NextResponse.json({
      success: true,
      data: reportsWithFavorite,
      count: reportsWithFavorite.length
    });
  } catch (error) {
    log.error('Error fetching favorite reports:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorite reports' },
      { status: 500 }
    );
  }
}
