export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createKpiReportSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  kpi_codes: z.array(z.string()).min(1),
  category: z.string().optional(),
  filters: z.record(z.unknown()).optional(),
});

/**
 * GET /api/kpi/reports
 * Get KPI report definitions
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
    const category = searchParams.get('category');
    const globalOnly = searchParams.get('global') === 'true';

    let query = supabase
      .from('kpi_reports')
      .select('*')
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    if (globalOnly) {
      query = query.eq('is_global', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    logger.error('Error fetching KPI reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI reports' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kpi/reports
 * Create a new KPI report
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
    const validatedData = createKpiReportSchema.parse(body);

    const {
      name,
      description,
      kpi_codes,
      category,
      filters
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

    // Type for KPI report insert
    type KpiReportInsert = {
      organization_id: string;
      name: string;
      description: string;
      kpi_codes: string[];
      category: string;
      filters: Record<string, unknown>;
      created_by: string;
    };

    const insertData: KpiReportInsert = {
      organization_id: (orgData as { organization_id: string }).organization_id,
      name,
      description,
      kpi_codes,
      category,
      filters: filters || {},
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('kpi_reports')
      .insert(insertData as never)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error creating KPI report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create KPI report' },
      { status: 500 }
    );
  }
}
