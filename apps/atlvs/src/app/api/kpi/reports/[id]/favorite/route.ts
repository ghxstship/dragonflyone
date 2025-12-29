export const dynamic = 'force-dynamic';

import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/kpi/reports/[id]/favorite
 * Toggle favorite status for a KPI report
 */
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if report exists
    const { data: report, error: reportError } = await supabase
      .from('kpi_reports')
      .select('id')
      .eq('id', id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('kpi_report_favorites')
      .select('id')
      .eq('report_id', id)
      .eq('user_id', user.id)
      .single();

    if (existingFavorite) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('kpi_report_favorites')
        .delete()
        .eq('report_id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        is_favorited: false,
        message: 'Report removed from favorites'
      });
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('kpi_report_favorites')
        .insert({
          report_id: id,
          user_id: user.id
        } as never);

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        is_favorited: true,
        message: 'Report added to favorites'
      });
    }
  } catch (error) {
    log.error('Error toggling favorite:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/kpi/reports/[id]/favorite
 * Check if report is favorited by current user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({
        success: true,
        is_favorited: false
      });
    }

    const { data: favorite } = await supabase
      .from('kpi_report_favorites')
      .select('id')
      .eq('report_id', id)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      is_favorited: !!favorite
    });
  } catch (error) {
    log.error('Error checking favorite status:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}
