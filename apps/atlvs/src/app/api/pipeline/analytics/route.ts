import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

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

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const period = searchParams.get('period') || '30d';
    const assignedTo = searchParams.get('assigned_to');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all deals
    let query = supabase
      .from('pipeline_deals')
      .select('id, stage, value, probability, created_at, closed_at, assigned_to');

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data: deals, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch pipeline data' },
        { status: 500 }
      );
    }

    // Calculate stage distribution
    const stageDistribution: Record<string, { count: number; value: number }> = {
      lead: { count: 0, value: 0 },
      qualified: { count: 0, value: 0 },
      proposal: { count: 0, value: 0 },
      negotiation: { count: 0, value: 0 },
      closed_won: { count: 0, value: 0 },
      closed_lost: { count: 0, value: 0 },
    };

    deals?.forEach((deal) => {
      if (stageDistribution[deal.stage]) {
        stageDistribution[deal.stage].count++;
        stageDistribution[deal.stage].value += deal.value || 0;
      }
    });

    // Calculate conversion rates
    const totalDeals = deals?.length || 0;
    const closedWon = deals?.filter(d => d.stage === 'closed_won').length || 0;
    const closedLost = deals?.filter(d => d.stage === 'closed_lost').length || 0;
    const closedTotal = closedWon + closedLost;
    const winRate = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;

    // Calculate pipeline value
    const openDeals = deals?.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)) || [];
    const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const weightedPipeline = openDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0);

    // Revenue this period
    const wonThisPeriod = deals?.filter(d => 
      d.stage === 'closed_won' && 
      d.closed_at && 
      new Date(d.closed_at) >= startDate
    ) || [];
    const revenueThisPeriod = wonThisPeriod.reduce((sum, d) => sum + (d.value || 0), 0);

    // Deals created this period
    const createdThisPeriod = deals?.filter(d => 
      new Date(d.created_at) >= startDate
    ).length || 0;

    // Average deal size
    const avgDealSize = closedWon > 0 
      ? (deals?.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (d.value || 0), 0) || 0) / closedWon 
      : 0;

    return NextResponse.json({
      summary: {
        total_deals: totalDeals,
        open_deals: openDeals.length,
        closed_won: closedWon,
        closed_lost: closedLost,
        win_rate: parseFloat(winRate.toFixed(1)),
        pipeline_value: pipelineValue,
        weighted_pipeline: weightedPipeline,
        revenue_this_period: revenueThisPeriod,
        deals_created_this_period: createdThisPeriod,
        avg_deal_size: avgDealSize,
      },
      stage_distribution: Object.entries(stageDistribution).map(([stage, data]) => ({
        stage,
        ...data,
      })),
      period,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
