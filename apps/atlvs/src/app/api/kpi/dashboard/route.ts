export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

interface KPIMetric {
  id: string;
  name: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  target: string;
  targetStatus: 'on_track' | 'at_risk' | 'off_track';
  category: string;
}

interface KPIDashboardResponse {
  kpis: KPIMetric[];
  summary: {
    total: number;
    on_track: number;
    at_risk: number;
    off_track: number;
  };
}

export const GET = apiRoute(
  async (request: NextRequest) => {
    const supabase = createAdminClient();
    
    // Parse optional date range from query params
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get('range') || 'month';
    
    const now = new Date();
    // Calculate date ranges based on rangeParam
    const daysMap: Record<string, number> = { week: 7, month: 30, quarter: 90, year: 365 };
    const days = daysMap[rangeParam] || 30;
    const thisMonthStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(thisMonthStart.getTime() - days * 24 * 60 * 60 * 1000);

    try {
      // Fetch revenue data from ledger entries
      const { data: currentRevenue } = await supabase
        .from('ledger_entries')
        .select('amount')
        .eq('side', 'credit')
        .gte('entry_date', thisMonthStart.toISOString().split('T')[0]);

      const { data: lastRevenue } = await supabase
        .from('ledger_entries')
        .select('amount')
        .eq('side', 'credit')
        .gte('entry_date', lastMonthStart.toISOString().split('T')[0])
        .lt('entry_date', thisMonthStart.toISOString().split('T')[0]);

      // Fetch deals data
      const { data: currentDeals } = await supabase
        .from('deals')
        .select('id, value, status')
        .gte('created_at', thisMonthStart.toISOString());

      const { data: lastDeals } = await supabase
        .from('deals')
        .select('id, value, status')
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', thisMonthStart.toISOString());

      // Fetch projects data
      const { data: projects } = await supabase
        .from('projects')
        .select('id, phase, budget');

      // Fetch assets data for utilization
      const { data: assets } = await supabase
        .from('assets')
        .select('id, state');

      // Calculate metrics
      const currentRevenueTotal = (currentRevenue || []).reduce((sum, r) => sum + (r.amount || 0), 0);
      const lastRevenueTotal = (lastRevenue || []).reduce((sum, r) => sum + (r.amount || 0), 0);
      const revenueChange = lastRevenueTotal > 0 
        ? ((currentRevenueTotal - lastRevenueTotal) / lastRevenueTotal) * 100 
        : 0;

      const currentDealsWon = (currentDeals || []).filter(d => d.status === 'won').length;
      const lastDealsWon = (lastDeals || []).filter(d => d.status === 'won').length;
      const dealsChange = lastDealsWon > 0 
        ? ((currentDealsWon - lastDealsWon) / lastDealsWon) * 100 
        : 0;

      const pipelineValue = (currentDeals || [])
        .filter(d => !['won', 'lost'].includes(d.status || ''))
        .reduce((sum, d) => sum + (d.value || 0), 0);
      const lastPipelineValue = (lastDeals || [])
        .filter(d => !['won', 'lost'].includes(d.status || ''))
        .reduce((sum, d) => sum + (d.value || 0), 0);
      const pipelineChange = lastPipelineValue > 0 
        ? ((pipelineValue - lastPipelineValue) / lastPipelineValue) * 100 
        : 0;

      const activeProjects = (projects || []).filter(p => 
        ['intake', 'preproduction', 'in_production'].includes(p.phase || '')
      ).length;

      const deployedAssets = (assets || []).filter(a => a.state === 'deployed').length;
      const totalAssets = (assets || []).length;
      const utilization = totalAssets > 0 ? (deployedAssets / totalAssets) * 100 : 0;

      // Build KPI metrics with targets
      const kpis: KPIMetric[] = [
        {
          id: 'revenue',
          name: 'Total Revenue',
          value: `$${(currentRevenueTotal / 1000000).toFixed(1)}M`,
          change: Math.round(revenueChange * 10) / 10,
          changeType: revenueChange >= 0 ? 'increase' : 'decrease',
          target: '$2.5M',
          targetStatus: currentRevenueTotal >= 2500000 ? 'on_track' : currentRevenueTotal >= 2000000 ? 'at_risk' : 'off_track',
          category: 'financial',
        },
        {
          id: 'deals',
          name: 'Deals Closed',
          value: String(currentDealsWon),
          change: Math.round(dealsChange * 10) / 10,
          changeType: dealsChange >= 0 ? 'increase' : 'decrease',
          target: '50',
          targetStatus: currentDealsWon >= 50 ? 'on_track' : currentDealsWon >= 40 ? 'at_risk' : 'off_track',
          category: 'sales',
        },
        {
          id: 'pipeline',
          name: 'Pipeline Value',
          value: `$${(pipelineValue / 1000000).toFixed(1)}M`,
          change: Math.round(pipelineChange * 10) / 10,
          changeType: pipelineChange >= 0 ? 'increase' : 'decrease',
          target: '$10M',
          targetStatus: pipelineValue >= 10000000 ? 'on_track' : pipelineValue >= 8000000 ? 'at_risk' : 'off_track',
          category: 'sales',
        },
        {
          id: 'utilization',
          name: 'Resource Utilization',
          value: `${Math.round(utilization)}%`,
          change: 0,
          changeType: 'neutral',
          target: '85%',
          targetStatus: utilization >= 85 ? 'on_track' : utilization >= 70 ? 'at_risk' : 'off_track',
          category: 'operations',
        },
        {
          id: 'projects',
          name: 'Active Projects',
          value: String(activeProjects),
          change: 0,
          changeType: 'neutral',
          target: '25',
          targetStatus: activeProjects >= 25 ? 'on_track' : activeProjects >= 20 ? 'at_risk' : 'off_track',
          category: 'operations',
        },
      ];

      const summary = {
        total: kpis.length,
        on_track: kpis.filter(k => k.targetStatus === 'on_track').length,
        at_risk: kpis.filter(k => k.targetStatus === 'at_risk').length,
        off_track: kpis.filter(k => k.targetStatus === 'off_track').length,
      };

      const response: KPIDashboardResponse = { kpis, summary };
      return NextResponse.json(response);
    } catch (error) {
      // Return empty response on error
      return NextResponse.json({
        kpis: [],
        summary: { total: 0, on_track: 0, at_risk: 0, off_track: 0 },
      });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    audit: { action: 'kpi:dashboard:view', resource: 'kpi' },
  }
);
