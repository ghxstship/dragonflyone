export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'ytd';
    const type = searchParams.get('type');
    const organizationId = searchParams.get('organization_id');

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'mtd':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'qtd':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Fetch revenue data from invoices
    let revenueQuery = supabase
      .from('invoices')
      .select('total_amount, client_id, clients(name)')
      .gte('invoice_date', startDate.toISOString())
      .eq('status', 'paid');

    if (organizationId) {
      revenueQuery = revenueQuery.eq('organization_id', organizationId);
    }

    const { data: invoices } = await revenueQuery;

    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

    // Fetch expense data
    let expenseQuery = supabase
      .from('expenses')
      .select('amount, category')
      .gte('expense_date', startDate.toISOString());

    if (organizationId) {
      expenseQuery = expenseQuery.eq('organization_id', organizationId);
    }

    const { data: expenses } = await expenseQuery;

    const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

    // Group expenses by category
    const expensesByCategory = expenses?.reduce((acc, exp) => {
      const cat = exp.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
      return acc;
    }, {} as Record<string, number>) || {};

    // Fetch project counts
    let projectQuery = supabase
      .from('projects')
      .select('status');

    if (organizationId) {
      projectQuery = projectQuery.eq('organization_id', organizationId);
    }

    const { data: projects } = await projectQuery;

    const projectCounts = {
      completed: projects?.filter(p => p.status === 'completed').length || 0,
      inProgress: projects?.filter(p => p.status === 'in_progress' || p.status === 'active').length || 0,
      planning: projects?.filter(p => p.status === 'planning' || p.status === 'draft').length || 0,
    };

    // Fetch asset utilization
    let assetQuery = supabase
      .from('assets')
      .select('category, status');

    if (organizationId) {
      assetQuery = assetQuery.eq('organization_id', organizationId);
    }

    const { data: assets } = await assetQuery;

    const assetsByCategory = assets?.reduce((acc, asset) => {
      const cat = asset.category || 'Other';
      if (!acc[cat]) {
        acc[cat] = { total: 0, inUse: 0 };
      }
      acc[cat].total++;
      if (asset.status === 'in_use' || asset.status === 'deployed') {
        acc[cat].inUse++;
      }
      return acc;
    }, {} as Record<string, { total: number; inUse: number }>) || {};

    const assetUtilization = Object.entries(assetsByCategory).map(([category, data]) => ({
      category,
      total: data.total,
      utilization: data.total > 0 ? Math.round((data.inUse / data.total) * 100) : 0,
    }));

    const reports = {
      revenue: {
        total: totalRevenue,
        byClient: [], // Would need aggregation
      },
      expenses: {
        total: totalExpenses,
        byCategory: Object.entries(expensesByCategory).map(([category, amount]) => ({
          category,
          amount,
        })),
      },
      profit: {
        gross: totalRevenue - totalExpenses,
        margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
      },
      projects: projectCounts,
      assets: {
        utilization: assetUtilization,
      },
    };

    if (type && type in reports) {
      return NextResponse.json({ [type]: reports[type as keyof typeof reports] });
    }

    return NextResponse.json({ reports, period });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
