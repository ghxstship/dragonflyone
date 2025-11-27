import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const allocationRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  allocation_type: z.enum(['percentage', 'headcount', 'square_footage', 'revenue', 'direct_labor', 'custom']),
  source_account_id: z.string().uuid().optional(),
  source_cost_pool: z.string().optional(),
  targets: z.array(z.object({
    target_type: z.enum(['project', 'department', 'cost_center', 'entity']),
    target_id: z.string().uuid(),
    allocation_percentage: z.number().min(0).max(100).optional(),
    allocation_basis: z.number().optional(),
  })),
  effective_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
});

const allocationSchema = z.object({
  rule_id: z.string().uuid(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  source_amount: z.number(),
});

// GET - Get cost allocation data
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'rules' | 'allocations' | 'pools' | 'summary' | 'report'
    const projectId = searchParams.get('project_id');
    const departmentId = searchParams.get('department_id');
    const period = searchParams.get('period'); // YYYY-MM

    if (type === 'rules') {
      // Get allocation rules
      const { data: rules, error } = await supabase
        .from('allocation_rules')
        .select(`
          *,
          targets:allocation_rule_targets(*)
        `)
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;

      return NextResponse.json({ rules });
    }

    if (type === 'allocations') {
      // Get allocation history
      let query = supabase
        .from('cost_allocations')
        .select(`
          *,
          rule:allocation_rules(id, name, allocation_type),
          details:allocation_details(target_type, target_id, allocated_amount)
        `)
        .order('period_end', { ascending: false });

      if (period) {
        const periodStart = `${period}-01T00:00:00Z`;
        const periodEnd = new Date(parseInt(period.split('-')[0]), parseInt(period.split('-')[1]), 0).toISOString();
        query = query.gte('period_start', periodStart).lte('period_end', periodEnd);
      }

      const { data: allocations, error } = await query.limit(100);

      if (error) throw error;

      return NextResponse.json({ allocations });
    }

    if (type === 'pools') {
      // Get cost pools (overhead categories to be allocated)
      const { data: pools, error } = await supabase
        .from('cost_pools')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;

      // Get current period totals
      const currentMonth = new Date().toISOString().substring(0, 7);
      const { data: poolTotals } = await supabase
        .from('ledger_entries')
        .select('cost_pool, debit, credit')
        .not('cost_pool', 'is', null)
        .gte('entry_date', `${currentMonth}-01`);

      const totals = poolTotals?.reduce((acc: Record<string, number>, e) => {
        const pool = e.cost_pool;
        acc[pool] = (acc[pool] || 0) + (e.debit - e.credit);
        return acc;
      }, {});

      const enrichedPools = pools?.map(p => ({
        ...p,
        current_balance: totals?.[p.code] || 0,
      }));

      return NextResponse.json({ pools: enrichedPools });
    }

    if (type === 'summary') {
      // Get allocation summary by target
      const targetType = searchParams.get('target_type') || 'project';
      
      const { data: details, error } = await supabase
        .from('allocation_details')
        .select(`
          target_type,
          target_id,
          allocated_amount,
          allocation:cost_allocations(period_start, period_end)
        `)
        .eq('target_type', targetType);

      if (error) throw error;

      // Group by target
      const byTarget = details?.reduce((acc: Record<string, { total: number; periods: any[] }>, d) => {
        if (!acc[d.target_id]) acc[d.target_id] = { total: 0, periods: [] };
        acc[d.target_id].total += d.allocated_amount;
        acc[d.target_id].periods.push({
          amount: d.allocated_amount,
          period: (d.allocation as any)?.period_start?.substring(0, 7),
        });
        return acc;
      }, {});

      // Get target names
      let targetNames: Record<string, string> = {};
      if (targetType === 'project') {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name')
          .in('id', Object.keys(byTarget || {}));
        targetNames = projects?.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {}) || {};
      } else if (targetType === 'department') {
        const { data: depts } = await supabase
          .from('departments')
          .select('id, name')
          .in('id', Object.keys(byTarget || {}));
        targetNames = depts?.reduce((acc, d) => ({ ...acc, [d.id]: d.name }), {}) || {};
      }

      const summary = Object.entries(byTarget || {}).map(([id, data]) => ({
        target_id: id,
        target_name: targetNames[id] || 'Unknown',
        total_allocated: data.total,
        period_count: data.periods.length,
      }));

      return NextResponse.json({ summary, target_type: targetType });
    }

    if (type === 'report') {
      // Get detailed allocation report
      const reportPeriod = period || new Date().toISOString().substring(0, 7);
      const periodStart = `${reportPeriod}-01T00:00:00Z`;
      const periodEnd = new Date(parseInt(reportPeriod.split('-')[0]), parseInt(reportPeriod.split('-')[1]), 0).toISOString();

      const { data: allocations, error } = await supabase
        .from('cost_allocations')
        .select(`
          *,
          rule:allocation_rules(name, allocation_type),
          details:allocation_details(target_type, target_id, allocated_amount, allocation_percentage)
        `)
        .gte('period_start', periodStart)
        .lte('period_end', periodEnd);

      if (error) throw error;

      // Build report structure
      const report = {
        period: reportPeriod,
        total_allocated: 0,
        by_rule: [] as any[],
        by_target_type: {} as Record<string, number>,
      };

      allocations?.forEach(alloc => {
        report.total_allocated += alloc.source_amount;
        
        report.by_rule.push({
          rule_name: (alloc.rule as any)?.name,
          allocation_type: (alloc.rule as any)?.allocation_type,
          source_amount: alloc.source_amount,
          targets: (alloc.details as any[])?.map(d => ({
            target_type: d.target_type,
            target_id: d.target_id,
            amount: d.allocated_amount,
            percentage: d.allocation_percentage,
          })),
        });

        (alloc.details as any[])?.forEach(d => {
          report.by_target_type[d.target_type] = (report.by_target_type[d.target_type] || 0) + d.allocated_amount;
        });
      });

      return NextResponse.json({ report });
    }

    // Default: return summary
    const { data: rules } = await supabase
      .from('allocation_rules')
      .select('id')
      .eq('status', 'active');

    const currentMonth = new Date().toISOString().substring(0, 7);
    const { data: allocations } = await supabase
      .from('cost_allocations')
      .select('source_amount')
      .gte('period_start', `${currentMonth}-01`);

    return NextResponse.json({
      summary: {
        active_rules: rules?.length || 0,
        current_month_allocated: allocations?.reduce((sum, a) => sum + a.source_amount, 0) || 0,
      },
    });
  } catch (error: any) {
    console.error('Cost allocation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create rule or run allocation
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_rule') {
      const validated = allocationRuleSchema.parse(body.data);
      const { targets, ...ruleData } = validated;

      // Validate percentages sum to 100 if percentage-based
      if (validated.allocation_type === 'percentage') {
        const totalPercentage = targets.reduce((sum, t) => sum + (t.allocation_percentage || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          return NextResponse.json({ error: 'Allocation percentages must sum to 100%' }, { status: 400 });
        }
      }

      const { data: rule, error } = await supabase
        .from('allocation_rules')
        .insert({
          ...ruleData,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create targets
      const targetRecords = targets.map(t => ({
        rule_id: rule.id,
        ...t,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('allocation_rule_targets').insert(targetRecords);

      return NextResponse.json({ rule }, { status: 201 });
    }

    if (action === 'run_allocation') {
      const validated = allocationSchema.parse(body.data);

      // Get rule with targets
      const { data: rule } = await supabase
        .from('allocation_rules')
        .select(`
          *,
          targets:allocation_rule_targets(*)
        `)
        .eq('id', validated.rule_id)
        .single();

      if (!rule) {
        return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
      }

      // Create allocation record
      const { data: allocation, error } = await supabase
        .from('cost_allocations')
        .insert({
          rule_id: validated.rule_id,
          period_start: validated.period_start,
          period_end: validated.period_end,
          source_amount: validated.source_amount,
          status: 'completed',
          allocated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Calculate and create allocation details
      const targets = (rule.targets as any[]) || [];
      let totalBasis = 0;

      if (rule.allocation_type !== 'percentage') {
        totalBasis = targets.reduce((sum, t) => sum + (t.allocation_basis || 0), 0);
      }

      const details = targets.map(t => {
        let percentage = t.allocation_percentage || 0;
        
        if (rule.allocation_type !== 'percentage' && totalBasis > 0) {
          percentage = ((t.allocation_basis || 0) / totalBasis) * 100;
        }

        const allocatedAmount = (validated.source_amount * percentage) / 100;

        return {
          allocation_id: allocation.id,
          target_type: t.target_type,
          target_id: t.target_id,
          allocation_percentage: percentage,
          allocated_amount: Math.round(allocatedAmount * 100) / 100,
          created_at: new Date().toISOString(),
        };
      });

      await supabase.from('allocation_details').insert(details);

      // Create ledger entries for each allocation
      for (const detail of details) {
        await supabase.from('ledger_entries').insert({
          entry_date: validated.period_end,
          description: `Cost allocation - ${rule.name}`,
          debit: detail.allocated_amount,
          credit: 0,
          account_type: 'expense',
          reference_type: 'allocation',
          reference_id: allocation.id,
          project_id: detail.target_type === 'project' ? detail.target_id : null,
          department_id: detail.target_type === 'department' ? detail.target_id : null,
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ 
        allocation, 
        details_count: details.length,
        total_allocated: validated.source_amount,
      }, { status: 201 });
    }

    if (action === 'auto_allocate_period') {
      // Run all active rules for a period
      const { period_start, period_end } = body.data;

      const { data: rules } = await supabase
        .from('allocation_rules')
        .select(`
          *,
          targets:allocation_rule_targets(*)
        `)
        .eq('status', 'active')
        .lte('effective_date', period_end);

      const results = [];

      for (const rule of rules || []) {
        // Get source amount from cost pool or account
        let sourceAmount = 0;

        if (rule.source_cost_pool) {
          const { data: entries } = await supabase
            .from('ledger_entries')
            .select('debit, credit')
            .eq('cost_pool', rule.source_cost_pool)
            .gte('entry_date', period_start)
            .lte('entry_date', period_end);

          sourceAmount = entries?.reduce((sum, e) => sum + (e.debit - e.credit), 0) || 0;
        }

        if (sourceAmount > 0) {
          // Create allocation
          const { data: allocation } = await supabase
            .from('cost_allocations')
            .insert({
              rule_id: rule.id,
              period_start,
              period_end,
              source_amount: sourceAmount,
              status: 'completed',
              allocated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (allocation) {
            results.push({
              rule_name: rule.name,
              source_amount: sourceAmount,
              allocation_id: allocation.id,
            });
          }
        }
      }

      return NextResponse.json({ 
        allocations_created: results.length,
        results,
      });
    }

    if (action === 'create_cost_pool') {
      const { code, name, description, account_ids } = body.data;

      const { data: pool, error } = await supabase
        .from('cost_pools')
        .insert({
          code,
          name,
          description,
          account_ids,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ pool }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Cost allocation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update rule
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: rule, error } = await supabase
      .from('allocation_rules')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ rule });
  } catch (error: any) {
    console.error('Cost allocation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deactivate rule
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('allocation_rules')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cost allocation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
