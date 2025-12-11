export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { getKPIByCode } from '@ghxstship/config/kpi-definitions';

/**
 * GET /api/kpi/[code]
 * Get a specific KPI definition by code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const kpi = getKPIByCode(params.code);

    if (!kpi) {
      return NextResponse.json(
        { success: false, error: 'KPI not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kpi
    });
  } catch (error) {
    logger.error('Error fetching KPI definition:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KPI definition' },
      { status: 500 }
    );
  }
}
