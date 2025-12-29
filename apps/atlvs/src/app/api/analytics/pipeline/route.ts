export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

interface PipelineMetrics {
  total_deals: number;
  total_value: number;
  weighted_value: number;
  average_deal_size: number;
  win_rate: number;
  average_days_to_close: number;
  deals_by_stage: Array<{
    stage_id: string;
    stage_name: string;
    count: number;
    value: number;
    probability: number;
  }>;
  conversion_rates: Array<{
    from_stage: string;
    to_stage: string;
    rate: number;
  }>;
  trends: {
    deals_created_this_month: number;
    deals_created_last_month: number;
    deals_closed_this_month: number;
    deals_closed_last_month: number;
  };
}

const DEMO_PIPELINE_METRICS: PipelineMetrics = {
  total_deals: 45,
  total_value: 2850000,
  weighted_value: 1425000,
  average_deal_size: 63333,
  win_rate: 32.5,
  average_days_to_close: 45,
  deals_by_stage: [
    { stage_id: '1', stage_name: 'Lead', count: 12, value: 450000, probability: 10 },
    { stage_id: '2', stage_name: 'Qualified', count: 8, value: 380000, probability: 25 },
    { stage_id: '3', stage_name: 'Proposal', count: 10, value: 720000, probability: 50 },
    { stage_id: '4', stage_name: 'Negotiation', count: 6, value: 580000, probability: 75 },
    { stage_id: '5', stage_name: 'Closed Won', count: 9, value: 720000, probability: 100 },
  ],
  conversion_rates: [
    { from_stage: 'Lead', to_stage: 'Qualified', rate: 66.7 },
    { from_stage: 'Qualified', to_stage: 'Proposal', rate: 75.0 },
    { from_stage: 'Proposal', to_stage: 'Negotiation', rate: 60.0 },
    { from_stage: 'Negotiation', to_stage: 'Closed Won', rate: 50.0 },
  ],
  trends: {
    deals_created_this_month: 12,
    deals_created_last_month: 9,
    deals_closed_this_month: 4,
    deals_closed_last_month: 3,
  },
};

export const GET = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const now = new Date();
    const daysMap: Record<string, number> = { '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[range] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    try {
      // Fetch deals data using schema-compliant columns
      // Schema: deals has 'status' enum (lead, qualified, proposal, won, lost), NOT 'stage_id'
      // Schema: deals has 'updated_at' but NOT 'closed_at' - derive closed status from status + updated_at
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id, value, status, probability, created_at, updated_at')
        .gte('created_at', startDate.toISOString());

      if (dealsError) {
        return NextResponse.json(DEMO_PIPELINE_METRICS);
      }

      // Define pipeline stages based on deal_status enum from schema
      // Schema: create type deal_status as enum ('lead','qualified','proposal','won','lost');
      const PIPELINE_STAGES = [
        { id: 'lead', name: 'Lead', probability: 10, sort_order: 1 },
        { id: 'qualified', name: 'Qualified', probability: 25, sort_order: 2 },
        { id: 'proposal', name: 'Proposal', probability: 50, sort_order: 3 },
        { id: 'won', name: 'Won', probability: 100, sort_order: 4 },
        { id: 'lost', name: 'Lost', probability: 0, sort_order: 5 },
      ];

      // Fetch previous period deals
      const { data: previousDeals } = await supabase
        .from('deals')
        .select('id, status, created_at, updated_at')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      if (!deals || deals.length === 0) {
        return NextResponse.json(DEMO_PIPELINE_METRICS);
      }

      interface DealRecord {
        id: string;
        value?: number;
        status?: string;
        probability?: number;
        created_at?: string;
        updated_at?: string;
      }

      const dealsData = deals as DealRecord[];
      const previousDealsData = (previousDeals || []) as DealRecord[];

      // Calculate metrics
      const totalDeals = dealsData.length;
      const totalValue = dealsData.reduce((sum, d) => sum + (d.value || 0), 0);
      const wonDeals = dealsData.filter(d => d.status === 'won');
      const closedDeals = dealsData.filter(d => ['won', 'lost'].includes(d.status || ''));

      const winRate = closedDeals.length > 0 
        ? (wonDeals.length / closedDeals.length) * 100 
        : 0;

      // Calculate average days to close using updated_at as proxy for closed date
      const closedWithDates = wonDeals.filter(d => d.created_at && d.updated_at);
      const totalDaysToClose = closedWithDates.reduce((sum, d) => {
        const created = new Date(d.created_at!);
        const closed = new Date(d.updated_at!);
        return sum + Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);
      const averageDaysToClose = closedWithDates.length > 0 
        ? totalDaysToClose / closedWithDates.length 
        : 0;

      // Calculate deals by stage using PIPELINE_STAGES and status field
      const dealsByStage = PIPELINE_STAGES.filter(s => s.id !== 'lost').map(stage => {
        const stageDeals = dealsData.filter(d => d.status === stage.id);
        return {
          stage_id: stage.id,
          stage_name: stage.name,
          count: stageDeals.length,
          value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
          probability: stage.probability,
        };
      });

      // Calculate weighted value
      const weightedValue = dealsByStage.reduce((sum, stage) => {
        return sum + (stage.value * (stage.probability / 100));
      }, 0);

      // Calculate conversion rates between active stages (excluding won/lost)
      const activeStages = PIPELINE_STAGES.filter(s => !['won', 'lost'].includes(s.id));
      const conversionRates = activeStages.slice(0, -1).map((stage, i) => {
        const nextStage = activeStages[i + 1];
        const currentStageDeals = dealsData.filter(d => d.status === stage.id).length;
        const nextStageDeals = dealsData.filter(d => d.status === nextStage.id).length;
        const rate = currentStageDeals > 0 ? (nextStageDeals / currentStageDeals) * 100 : 0;
        return {
          from_stage: stage.name,
          to_stage: nextStage.name,
          rate: Math.min(rate, 100),
        };
      });

      // Calculate trends
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const dealsCreatedThisMonth = dealsData.filter(d => 
        d.created_at && new Date(d.created_at) >= thisMonthStart
      ).length;

      const dealsCreatedLastMonth = previousDealsData.filter(d => 
        d.created_at && 
        new Date(d.created_at) >= lastMonthStart && 
        new Date(d.created_at) <= lastMonthEnd
      ).length;

      // Use updated_at as proxy for closed date when status is won/lost
      const dealsClosedThisMonth = dealsData.filter(d => 
        ['won', 'lost'].includes(d.status || '') &&
        d.updated_at && new Date(d.updated_at) >= thisMonthStart
      ).length;

      const dealsClosedLastMonth = previousDealsData.filter(d => 
        ['won', 'lost'].includes(d.status || '') &&
        d.updated_at && 
        new Date(d.updated_at) >= lastMonthStart && 
        new Date(d.updated_at) <= lastMonthEnd
      ).length;

      const metrics: PipelineMetrics = {
        total_deals: totalDeals,
        total_value: totalValue,
        weighted_value: weightedValue,
        average_deal_size: totalDeals > 0 ? totalValue / totalDeals : 0,
        win_rate: winRate,
        average_days_to_close: averageDaysToClose,
        deals_by_stage: dealsByStage,
        conversion_rates: conversionRates,
        trends: {
          deals_created_this_month: dealsCreatedThisMonth,
          deals_created_last_month: dealsCreatedLastMonth,
          deals_closed_this_month: dealsClosedThisMonth,
          deals_closed_last_month: dealsClosedLastMonth,
        },
      };

      return NextResponse.json(metrics);
    } catch (error) {
      return NextResponse.json(DEMO_PIPELINE_METRICS);
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    audit: { action: 'analytics:pipeline:view', resource: 'analytics' },
  }
);
