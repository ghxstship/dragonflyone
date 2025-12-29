export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createKpiDataSchema = z.object({
  kpi_code: z.string().min(1),
  kpi_name: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * GET /api/kpi/data
 * Get KPI data points with filtering
 */
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    const kpiCode = searchParams.get('kpi_code');
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('kpi_data_points')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(limit);

    if (kpiCode) {
      query = query.eq('kpi_code', kpiCode);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('calculated_at', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    logger.error('Error fetching KPI data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kpi/data
 * Record a new KPI data point
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const validatedData = createKpiDataSchema.parse(body);

    const {
      kpi_code,
      kpi_name,
      value,
      unit,
      project_id,
      event_id,
      period_start,
      period_end,
      metadata
    } = validatedData;

    // Get current user's organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: orgData } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgData) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Call the database function to record the KPI
    interface OrgRecord { organization_id: string }
    const orgRecord = orgData as OrgRecord;
    const { data, error } = await supabase.rpc('record_kpi_data_point', {
      p_organization_id: orgRecord.organization_id,
      p_kpi_code: kpi_code,
      p_kpi_name: kpi_name,
      p_value: value,
      p_unit: unit,
      p_project_id: project_id || null,
      p_event_id: event_id || null,
      p_period_start: period_start || null,
      p_period_end: period_end || null,
      p_metadata: metadata || {}
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { id: data }
    });
  } catch (error) {
    logger.error('Error recording KPI data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record KPI data' },
      { status: 500 }
    );
  }
}
