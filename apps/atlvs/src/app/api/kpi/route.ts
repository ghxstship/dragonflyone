import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { KPI_MASTER_LIST, getKPIByCode } from '@ghxstship/config/kpi-definitions';
import type { KPIDefinition } from '@ghxstship/config/types/kpi-types';

/**
 * GET /api/kpi
 * Get all KPI definitions or filter by category/subcategory
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const enabled = searchParams.get('enabled');

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
    console.error('Error fetching KPI definitions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI definitions' },
      { status: 500 }
    );
  }
}
