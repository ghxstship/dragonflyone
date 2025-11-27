import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const jobCostSchema = z.object({
  project_id: z.string().uuid(),
  cost_type: z.enum(['labor', 'material', 'equipment', 'subcontractor', 'overhead', 'other']),
  cost_code: z.string().optional(),
  description: z.string(),
  quantity: z.number().optional(),
  unit_cost: z.number().optional(),
  total_cost: z.number(),
  billable: z.boolean().default(true),
  billing_rate: z.number().optional(),
  employee_id: z.string().uuid().optional(),
  vendor_id: z.string().uuid().optional(),
  expense_id: z.string().uuid().optional(),
  timesheet_id: z.string().uuid().optional(),
  cost_date: z.string().datetime(),
  notes: z.string().optional(),
});

const costCodeSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['labor', 'material', 'equipment', 'subcontractor', 'overhead', 'other']),
  description: z.string().optional(),
  default_rate: z.number().optional(),
  is_billable: z.boolean().default(true),
});

// GET - Get job costing data
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'project' | 'codes' | 'summary' | 'profitability' | 'wip'
    const projectId = searchParams.get('project_id');
    const costType = searchParams.get('cost_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (type === 'project' && projectId) {
      // Get detailed job costs for a project
      let query = supabase
        .from('job_costs')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name),
          vendor:vendors(id, name)
        `)
        .eq('project_id', projectId)
        .order('cost_date', { ascending: false });

      if (costType) query = query.eq('cost_type', costType);
      if (startDate) query = query.gte('cost_date', startDate);
      if (endDate) query = query.lte('cost_date', endDate);

      const { data: costs, error } = await query;

      if (error) throw error;

      // Get project budget
      const { data: project } = await supabase
        .from('projects')
        .select('id, name, budget, revenue')
        .eq('id', projectId)
        .single();

      // Calculate totals by type
      const byType = costs?.reduce((acc: Record<string, { count: number; total: number; billable: number }>, c) => {
        if (!acc[c.cost_type]) acc[c.cost_type] = { count: 0, total: 0, billable: 0 };
        acc[c.cost_type].count++;
        acc[c.cost_type].total += c.total_cost;
        if (c.billable) acc[c.cost_type].billable += c.total_cost;
        return acc;
      }, {});

      const totalCost = costs?.reduce((sum, c) => sum + c.total_cost, 0) || 0;
      const billableCost = costs?.reduce((sum, c) => c.billable ? sum + c.total_cost : sum, 0) || 0;
      const billedAmount = costs?.reduce((sum, c) => c.billable && c.billing_rate ? sum + (c.quantity || 1) * c.billing_rate : sum, 0) || 0;

      return NextResponse.json({
        costs,
        project,
        summary: {
          total_cost: totalCost,
          billable_cost: billableCost,
          non_billable_cost: totalCost - billableCost,
          billed_amount: billedAmount,
          gross_margin: billedAmount - totalCost,
          margin_percentage: billedAmount > 0 ? ((billedAmount - totalCost) / billedAmount) * 100 : 0,
          budget_remaining: (project?.budget || 0) - totalCost,
          budget_utilization: project?.budget ? (totalCost / project.budget) * 100 : 0,
        },
        by_type: byType,
      });
    }

    if (type === 'codes') {
      // Get cost codes
      const { data: codes, error } = await supabase
        .from('cost_codes')
        .select('*')
        .eq('status', 'active')
        .order('code', { ascending: true });

      if (error) throw error;

      return NextResponse.json({ codes });
    }

    if (type === 'summary') {
      // Get job cost summary across all projects
      const { data: costs, error } = await supabase
        .from('job_costs')
        .select(`
          project_id,
          cost_type,
          total_cost,
          billable,
          project:projects(id, name, budget, status)
        `)
        .gte('cost_date', startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by project
      const byProject = costs?.reduce((acc: Record<string, any>, c) => {
        const pid = c.project_id;
        if (!acc[pid]) {
          acc[pid] = {
            project_id: pid,
            project_name: (c.project as any)?.name,
            budget: (c.project as any)?.budget || 0,
            status: (c.project as any)?.status,
            total_cost: 0,
            billable_cost: 0,
            by_type: {},
          };
        }
        acc[pid].total_cost += c.total_cost;
        if (c.billable) acc[pid].billable_cost += c.total_cost;
        
        if (!acc[pid].by_type[c.cost_type]) acc[pid].by_type[c.cost_type] = 0;
        acc[pid].by_type[c.cost_type] += c.total_cost;
        
        return acc;
      }, {});

      const projectSummaries = Object.values(byProject).map((p: any) => ({
        ...p,
        budget_variance: p.budget - p.total_cost,
        budget_utilization: p.budget > 0 ? (p.total_cost / p.budget) * 100 : 0,
      }));

      return NextResponse.json({
        projects: projectSummaries,
        totals: {
          total_cost: projectSummaries.reduce((sum, p) => sum + p.total_cost, 0),
          total_budget: projectSummaries.reduce((sum, p) => sum + p.budget, 0),
          total_variance: projectSummaries.reduce((sum, p) => sum + p.budget_variance, 0),
        },
      });
    }

    if (type === 'profitability') {
      // Get project profitability analysis
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          budget,
          revenue,
          status,
          start_date,
          end_date,
          costs:job_costs(total_cost, billable)
        `)
        .in('status', ['active', 'completed']);

      if (error) throw error;

      const profitability = projects?.map(project => {
        const costs = (project.costs as any[]) || [];
        const totalCost = costs.reduce((sum, c) => sum + c.total_cost, 0);
        const revenue = project.revenue || 0;
        const grossProfit = revenue - totalCost;
        const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

        return {
          project_id: project.id,
          project_name: project.name,
          status: project.status,
          budget: project.budget,
          revenue,
          total_cost: totalCost,
          gross_profit: grossProfit,
          gross_margin: Math.round(grossMargin * 100) / 100,
          budget_variance: (project.budget || 0) - totalCost,
          is_profitable: grossProfit > 0,
        };
      });

      // Sort by profitability
      profitability?.sort((a, b) => b.gross_margin - a.gross_margin);

      const totalRevenue = profitability?.reduce((sum, p) => sum + p.revenue, 0) || 0;
      const totalCost = profitability?.reduce((sum, p) => sum + p.total_cost, 0) || 0;

      return NextResponse.json({
        projects: profitability,
        summary: {
          total_revenue: totalRevenue,
          total_cost: totalCost,
          total_profit: totalRevenue - totalCost,
          average_margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
          profitable_projects: profitability?.filter(p => p.is_profitable).length || 0,
          unprofitable_projects: profitability?.filter(p => !p.is_profitable).length || 0,
        },
      });
    }

    if (type === 'wip') {
      // Get Work in Progress report
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          budget,
          revenue,
          percent_complete,
          costs:job_costs(total_cost),
          billings:client_invoices(amount, status)
        `)
        .eq('status', 'active');

      if (error) throw error;

      const wipReport = projects?.map(project => {
        const totalCost = (project.costs as any[])?.reduce((sum, c) => sum + c.total_cost, 0) || 0;
        const totalBilled = (project.billings as any[])?.filter(b => b.status !== 'voided').reduce((sum, b) => sum + b.amount, 0) || 0;
        const percentComplete = project.percent_complete || 0;
        const earnedRevenue = (project.revenue || 0) * (percentComplete / 100);
        
        // WIP = Earned Revenue - Billed Amount
        const wip = earnedRevenue - totalBilled;

        return {
          project_id: project.id,
          project_name: project.name,
          contract_value: project.revenue || 0,
          percent_complete: percentComplete,
          costs_to_date: totalCost,
          earned_revenue: earnedRevenue,
          billed_to_date: totalBilled,
          wip_balance: wip,
          wip_type: wip > 0 ? 'underbilled' : wip < 0 ? 'overbilled' : 'balanced',
          estimated_cost_to_complete: (project.budget || 0) - totalCost,
        };
      });

      const totalUnderbilled = wipReport?.filter(w => w.wip_balance > 0).reduce((sum, w) => sum + w.wip_balance, 0) || 0;
      const totalOverbilled = wipReport?.filter(w => w.wip_balance < 0).reduce((sum, w) => sum + Math.abs(w.wip_balance), 0) || 0;

      return NextResponse.json({
        wip_report: wipReport,
        summary: {
          total_underbilled: totalUnderbilled,
          total_overbilled: totalOverbilled,
          net_wip: totalUnderbilled - totalOverbilled,
          underbilled_count: wipReport?.filter(w => w.wip_type === 'underbilled').length || 0,
          overbilled_count: wipReport?.filter(w => w.wip_type === 'overbilled').length || 0,
        },
      });
    }

    // Default: return overall summary
    const { data: costs, error } = await supabase
      .from('job_costs')
      .select('cost_type, total_cost, billable')
      .gte('cost_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const totalCost = costs?.reduce((sum, c) => sum + c.total_cost, 0) || 0;
    const billableCost = costs?.reduce((sum, c) => c.billable ? sum + c.total_cost : sum, 0) || 0;

    return NextResponse.json({
      summary: {
        total_cost_last_30_days: totalCost,
        billable_cost: billableCost,
        non_billable_cost: totalCost - billableCost,
        cost_entries: costs?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Job costing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create job cost or cost code
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_cost') {
      const validated = jobCostSchema.parse(body.data);

      const { data: cost, error } = await supabase
        .from('job_costs')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ cost }, { status: 201 });
    }

    if (action === 'create_cost_code') {
      const validated = costCodeSchema.parse(body.data);

      const { data: code, error } = await supabase
        .from('cost_codes')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ code }, { status: 201 });
    }

    if (action === 'import_timesheet_costs') {
      // Import labor costs from timesheets
      const { project_id, start_date, end_date, labor_rate } = body.data;

      const { data: timesheets, error } = await supabase
        .from('timesheets')
        .select(`
          id,
          employee_id,
          hours,
          date,
          employee:platform_users(id, first_name, last_name, hourly_rate)
        `)
        .eq('project_id', project_id)
        .gte('date', start_date)
        .lte('date', end_date)
        .eq('status', 'approved');

      if (error) throw error;

      const costRecords = timesheets?.map(ts => {
        const rate = labor_rate || (ts.employee as any)?.hourly_rate || 50;
        return {
          project_id,
          cost_type: 'labor',
          description: `Labor - ${(ts.employee as any)?.first_name} ${(ts.employee as any)?.last_name}`,
          quantity: ts.hours,
          unit_cost: rate,
          total_cost: ts.hours * rate,
          billable: true,
          employee_id: ts.employee_id,
          timesheet_id: ts.id,
          cost_date: ts.date,
          created_at: new Date().toISOString(),
        };
      });

      const { data: costs, error: insertError } = await supabase
        .from('job_costs')
        .insert(costRecords || [])
        .select();

      if (insertError) throw insertError;

      return NextResponse.json({ 
        imported: costs?.length || 0,
        total_cost: costs?.reduce((sum, c) => sum + c.total_cost, 0) || 0,
      }, { status: 201 });
    }

    if (action === 'import_expense_costs') {
      // Import costs from expenses
      const { project_id, start_date, end_date } = body.data;

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('project_id', project_id)
        .gte('expense_date', start_date)
        .lte('expense_date', end_date)
        .eq('status', 'approved')
        .is('job_cost_id', null);

      if (error) throw error;

      const costRecords = expenses?.map(exp => ({
        project_id,
        cost_type: exp.category === 'materials' ? 'material' : 
                   exp.category === 'equipment' ? 'equipment' : 'other',
        description: exp.description,
        total_cost: exp.amount,
        billable: exp.billable || false,
        expense_id: exp.id,
        cost_date: exp.expense_date,
        created_at: new Date().toISOString(),
      }));

      const { data: costs, error: insertError } = await supabase
        .from('job_costs')
        .insert(costRecords || [])
        .select();

      if (insertError) throw insertError;

      // Update expenses with job_cost_id
      for (const cost of costs || []) {
        await supabase
          .from('expenses')
          .update({ job_cost_id: cost.id })
          .eq('id', cost.expense_id);
      }

      return NextResponse.json({ 
        imported: costs?.length || 0,
        total_cost: costs?.reduce((sum, c) => sum + c.total_cost, 0) || 0,
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Job costing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update cost or code
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'cost') {
      const { data: cost, error } = await supabase
        .from('job_costs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ cost });
    }

    if (type === 'code') {
      const { data: code, error } = await supabase
        .from('cost_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ code });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Job costing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete cost entry
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('job_costs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Job costing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
