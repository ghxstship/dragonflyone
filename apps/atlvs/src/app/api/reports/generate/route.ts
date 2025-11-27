import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const generateReportSchema = z.object({
  report_type: z.enum(['financial', 'project', 'asset', 'workforce', 'custom']),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  filters: z.record(z.any()).optional(),
  grouping: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
});

async function generateFinancialReport(supabaseAdmin: ReturnType<typeof createAdminClient>, start: string, end: string, filters: any) {
  const { data: revenue } = await supabaseAdmin
    .from('ledger_entries')
    .select('amount, type, created_at, account_id')
    .eq('type', 'credit')
    .gte('created_at', start)
    .lte('created_at', end);

  const { data: expenses } = await supabaseAdmin
    .from('ledger_entries')
    .select('amount, type, created_at, account_id')
    .eq('type', 'debit')
    .gte('created_at', start)
    .lte('created_at', end);

  interface LedgerEntry { amount: number; type: string; created_at: string; account_id: string }
  const revenueEntries = (revenue || []) as LedgerEntry[];
  const expenseEntries = (expenses || []) as LedgerEntry[];
  const totalRevenue = revenueEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + e.amount, 0);

  return {
    summary: {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: totalRevenue - totalExpenses,
      profit_margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
    },
    details: {
      revenue: revenue || [],
      expenses: expenses || [],
    },
  };
}

async function generateProjectReport(supabaseAdmin: ReturnType<typeof createAdminClient>, start: string, end: string, filters: Record<string, unknown>) {
  let query = (supabaseAdmin as any)
    .from('projects')
    .select('id, name, status, estimated_budget, actual_cost, start_date, end_date, created_at')
    .gte('created_at', start)
    .lte('created_at', end);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data } = await query;
  
  interface ProjectRow {
    id: string;
    name: string;
    status: string;
    estimated_budget: number | null;
    actual_cost: number | null;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
  }
  const projects = (data as unknown as ProjectRow[]) || [];

  const summary = {
    total_projects: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    on_budget: projects.filter(p => (p.actual_cost || 0) <= (p.estimated_budget || 0)).length,
    over_budget: projects.filter(p => (p.actual_cost || 0) > (p.estimated_budget || 0)).length,
    total_budget: projects.reduce((sum, p) => sum + (p.estimated_budget || 0), 0),
    total_actual: projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0),
  };

  return { summary, projects };
}

async function generateAssetReport(supabaseAdmin: ReturnType<typeof createAdminClient>, start: string, end: string, filters: Record<string, unknown>) {
  const { data } = await (supabaseAdmin as any)
    .from('assets')
    .select('id, name, type, status, value, purchase_date, location');

  interface AssetRow {
    id: string;
    name: string;
    type: string;
    status: string;
    value: number;
    purchase_date: string;
    location: string;
  }
  const assets = (data || []) as AssetRow[];

  const summary = {
    total_assets: assets.length,
    total_value: assets.reduce((sum, a) => sum + (a.value || 0), 0),
    by_status: {
      active: assets.filter(a => a.status === 'active').length,
      maintenance: assets.filter(a => a.status === 'maintenance').length,
      retired: assets.filter(a => a.status === 'retired').length,
    },
    by_type: assets.reduce((acc: Record<string, number>, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {}),
  };

  return { summary, assets };
}

async function generateWorkforceReport(supabaseAdmin: ReturnType<typeof createAdminClient>, start: string, end: string, filters: Record<string, unknown>) {
  const { data } = await (supabaseAdmin as any)
    .from('workforce_employees')
    .select('id, full_name, role, status, salary, hire_date, department');

  interface EmployeeRow {
    id: string;
    full_name: string;
    role: string;
    status: string;
    salary: number;
    hire_date: string;
    department: string;
  }
  const employees = (data || []) as EmployeeRow[];

  const summary = {
    total_employees: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    total_payroll: employees.filter(e => e.status === 'active')
      .reduce((sum, e) => sum + (e.salary || 0), 0),
    by_department: employees.reduce((acc: Record<string, number>, e) => {
      acc[e.department || 'Unknown'] = (acc[e.department || 'Unknown'] || 0) + 1;
      return acc;
    }, {}),
    by_role: employees.reduce((acc: Record<string, number>, e) => {
      acc[e.role] = (acc[e.role] || 0) + 1;
      return acc;
    }, {}),
  };

  return { summary, employees };
}

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const data = generateReportSchema.parse(body);

    let reportData: any;

    switch (data.report_type) {
      case 'financial':
        reportData = await generateFinancialReport(
          supabaseAdmin,
          data.period_start,
          data.period_end,
          data.filters || {}
        );
        break;
      case 'project':
        reportData = await generateProjectReport(
          supabaseAdmin,
          data.period_start,
          data.period_end,
          data.filters || {}
        );
        break;
      case 'asset':
        reportData = await generateAssetReport(
          supabaseAdmin,
          data.period_start,
          data.period_end,
          data.filters || {}
        );
        break;
      case 'workforce':
        reportData = await generateWorkforceReport(
          supabaseAdmin,
          data.period_start,
          data.period_end,
          data.filters || {}
        );
        break;
      default:
        return NextResponse.json({ error: 'Unsupported report type' }, { status: 400 });
    }

    const { data: report, error } = await supabaseAdmin
      .from('generated_reports')
      .insert({
        report_type: data.report_type,
        period_start: data.period_start,
        period_end: data.period_end,
        format: data.format,
        data: reportData,
        generated_by: context.user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save report', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      report_id: report.id,
      report_type: data.report_type,
      data: reportData,
      generated_at: report.created_at,
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    validation: generateReportSchema,
    audit: { action: 'report:generate', resource: 'reports' },
  }
);
