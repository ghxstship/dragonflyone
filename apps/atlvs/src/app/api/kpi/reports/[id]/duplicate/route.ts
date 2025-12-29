export const dynamic = 'force-dynamic';

import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const duplicateReportSchema = z.object({
  name: z.string().optional(),
});

interface KpiReport {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  kpi_codes: string[];
  category: string | null;
  filters: Record<string, unknown>;
  is_global: boolean;
}

/**
 * POST /api/kpi/reports/[id]/duplicate
 * Duplicate a KPI report to create a user copy
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
    const rawBody = await request.json().catch(() => ({}));
    const body = duplicateReportSchema.parse(rawBody);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get source report
    const { data: sourceData, error: sourceError } = await supabase
      .from('kpi_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (sourceError || !sourceData) {
      return NextResponse.json(
        { success: false, error: 'Source report not found' },
        { status: 404 }
      );
    }

    const sourceReport = sourceData as KpiReport;

    // Get user's organization
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

    // Create duplicate
    const newName = body.name || `${sourceReport.name} (Copy)`;
    
    const insertData = {
      organization_id: (orgData as { organization_id: string }).organization_id,
      name: newName,
      description: sourceReport.description,
      kpi_codes: sourceReport.kpi_codes,
      category: sourceReport.category,
      filters: sourceReport.filters || {},
      is_global: false,
      is_user_copy: true,
      source_report_id: id,
      created_by: user.id
    };

    const { data: newReport, error: insertError } = await supabase
      .from('kpi_reports')
      .insert(insertData as never)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      data: newReport,
      message: 'Report duplicated successfully'
    });
  } catch (error) {
    log.error('Error duplicating report:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate report' },
      { status: 500 }
    );
  }
}
