import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const dashboardQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  compare_previous: z.boolean().default(true),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    const supabaseAdmin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const params = dashboardQuerySchema.parse({
      period: searchParams.get('period') || 'month',
      compare_previous: searchParams.get('compare_previous') !== 'false',
    });

    const now = new Date();
    const periodMap = {
      day: 1,
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    };

    const days = periodMap[params.period];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      { data: projects },
      { data: deals },
      { data: revenue },
      { data: expenses },
      { data: assets },
      { data: employees },
    ] = await Promise.all([
      supabaseAdmin
        .from('projects')
        .select('id, status, budget, created_at')
        .gte('created_at', startDate.toISOString()),
      supabaseAdmin
        .from('deals')
        .select('id, status, value, created_at, closed_at')
        .gte('created_at', startDate.toISOString()),
      supabaseAdmin
        .from('ledger_entries')
        .select('amount, created_at')
        .eq('type', 'credit')
        .gte('created_at', startDate.toISOString()),
      supabaseAdmin
        .from('ledger_entries')
        .select('amount, created_at')
        .eq('type', 'debit')
        .gte('created_at', startDate.toISOString()),
      supabaseAdmin
        .from('assets')
        .select('id, status, value')
        .eq('status', 'active'),
      supabaseAdmin
        .from('employees')
        .select('id, status, salary')
        .eq('status', 'active'),
    ]);

    let previousMetrics = null;
    if (params.compare_previous) {
      const [
        { data: prevProjects },
        { data: prevDeals },
        { data: prevRevenue },
      ] = await Promise.all([
        supabaseAdmin
          .from('projects')
          .select('id')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
        supabaseAdmin
          .from('deals')
          .select('id, value')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
        supabaseAdmin
          .from('ledger_entries')
          .select('amount')
          .eq('type', 'credit')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
      ]);

      type RevenueEntry = { amount: number };
      const prevRevenueData = (prevRevenue || []) as RevenueEntry[];
      previousMetrics = {
        projects: prevProjects?.length || 0,
        deals: prevDeals?.length || 0,
        revenue: prevRevenueData.reduce((sum: number, e: RevenueEntry) => sum + (e.amount || 0), 0),
      };
    }

    // Cast to any to work around Supabase type generation issues
    const projectsData = (projects || []) as any[];
    const dealsData = (deals || []) as any[];
    const revenueData = (revenue || []) as any[];
    const expensesData = (expenses || []) as any[];
    const assetsData = (assets || []) as any[];
    const employeesData = (employees || []) as any[];

    const currentMetrics = {
      projects: {
        total: projectsData.length,
        active: projectsData.filter(p => p.status === 'active').length,
        completed: projectsData.filter(p => p.status === 'completed').length,
        totalBudget: projectsData.reduce((sum, p) => sum + (p.budget || 0), 0),
      },
      deals: {
        total: dealsData.length,
        won: dealsData.filter(d => d.status === 'won').length,
        lost: dealsData.filter(d => d.status === 'lost').length,
        pipeline: dealsData.filter(d => !['won', 'lost'].includes(d.status)).length,
        totalValue: dealsData.reduce((sum, d) => sum + (d.value || 0), 0),
        wonValue: dealsData.filter(d => d.status === 'won').reduce((sum, d) => sum + (d.value || 0), 0),
      },
      financial: {
        revenue: revenueData.reduce((sum, e) => sum + (e.amount || 0), 0),
        expenses: expensesData.reduce((sum, e) => sum + (e.amount || 0), 0),
        profit: revenueData.reduce((sum, e) => sum + (e.amount || 0), 0) - 
                expensesData.reduce((sum, e) => sum + (e.amount || 0), 0),
      },
      assets: {
        total: assetsData.length,
        totalValue: assetsData.reduce((sum, a) => sum + (a.value || 0), 0),
      },
      workforce: {
        total: employeesData.length,
        totalPayroll: employeesData.reduce((sum, e) => sum + (e.salary || 0), 0),
      },
    };

    const changes = previousMetrics ? {
      projects: ((currentMetrics.projects.total - previousMetrics.projects) / (previousMetrics.projects || 1)) * 100,
      deals: ((currentMetrics.deals.total - previousMetrics.deals) / (previousMetrics.deals || 1)) * 100,
      revenue: ((currentMetrics.financial.revenue - previousMetrics.revenue) / (previousMetrics.revenue || 1)) * 100,
    } : null;

    return NextResponse.json({
      period: params.period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      metrics: currentMetrics,
      changes,
      previousPeriod: previousMetrics,
    });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'analytics:dashboard', resource: 'analytics' },
  }
);
