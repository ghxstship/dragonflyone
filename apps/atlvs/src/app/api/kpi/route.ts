export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { KPI_MASTER_LIST, getKPIByCode } from '@ghxstship/config/kpi-definitions';
import type { KPIDefinition } from '@ghxstship/config/types/kpi-types';

/**
 * GET /api/kpi
 * Get all KPI definitions or filter by category/subcategory
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

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const enabled = searchParams.get('enabled');

    // If code is specified, return single KPI
    if (code) {
      const kpi = getKPIByCode(code);
      if (!kpi) {
        return NextResponse.json(
          { success: false, error: `KPI with code '${code}' not found` },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: kpi });
    }

    let kpis = KPI_MASTER_LIST;

    // Filter by category
    if (category) {
      kpis = kpis.filter((kpi: KPIDefinition) => kpi.category === category);
    }

    // Filter by subcategory
    if (subcategory) {
      kpis = kpis.filter((kpi: KPIDefinition) => kpi.subcategory === subcategory);
    }

    // Filter by enabled status
    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      kpis = kpis.filter((kpi: KPIDefinition) => kpi.enabled === isEnabled);
    }

    return NextResponse.json({
      success: true,
      data: kpis,
      count: kpis.length
    });
  } catch (error) {
    logger.error('Error fetching KPI definitions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI definitions' },
      { status: 500 }
    );
  }
}
