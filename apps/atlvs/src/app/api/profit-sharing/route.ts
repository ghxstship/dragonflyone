import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const profitSharingPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  plan_type: z.enum(['percentage_of_profit', 'percentage_of_salary', 'tiered', 'points_based']),
  profit_threshold: z.number().min(0).optional(),
  allocation_method: z.enum(['equal', 'salary_weighted', 'tenure_weighted', 'performance_weighted', 'custom']),
  vesting_schedule: z.object({
    type: z.enum(['immediate', 'cliff', 'graded']),
    cliff_months: z.number().optional(),
    graded_schedule: z.array(z.object({
      months: z.number(),
      percentage: z.number(),
    })).optional(),
  }).optional(),
  eligibility_criteria: z.object({
    min_tenure_months: z.number().optional(),
    min_hours_per_week: z.number().optional(),
    employee_types: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
  }).optional(),
  effective_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
});

const distributionSchema = z.object({
  plan_id: z.string().uuid(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  total_profit: z.number(),
  distribution_percentage: z.number().min(0).max(100),
});

// GET - Get profit sharing data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'plans' | 'distributions' | 'employee' | 'forecast'
    const planId = searchParams.get('plan_id');
    const employeeId = searchParams.get('employee_id');
    const period = searchParams.get('period');

    if (type === 'plans') {
      const { data: plans, error } = await supabase
        .from('profit_sharing_plans')
        .select('*')
        .eq('status', 'active')
        .order('effective_date', { ascending: false });

      if (error) throw error;

      return NextResponse.json({ plans });
    }

    if (type === 'distributions') {
      let query = supabase
        .from('profit_sharing_distributions')
        .select(`
          *,
          plan:profit_sharing_plans(id, name, plan_type),
          allocations:profit_sharing_allocations(employee_id, gross_amount, vested_amount, status)
        `)
        .order('period_end', { ascending: false });

      if (planId) query = query.eq('plan_id', planId);
      if (period) {
        query = query.gte('period_start', `${period}-01`).lte('period_end', `${period}-31`);
      }

      const { data: distributions, error } = await query;

      if (error) throw error;

      const enrichedDistributions = distributions?.map(d => ({
        ...d,
        total_allocated: (d.allocations as any[])?.reduce((sum, a) => sum + a.gross_amount, 0) || 0,
        total_vested: (d.allocations as any[])?.reduce((sum, a) => sum + a.vested_amount, 0) || 0,
        participant_count: (d.allocations as any[])?.length || 0,
      }));

      return NextResponse.json({ distributions: enrichedDistributions });
    }

    if (type === 'employee' && employeeId) {
      // Get employee's profit sharing history
      const { data: allocations, error } = await supabase
        .from('profit_sharing_allocations')
        .select(`
          *,
          distribution:profit_sharing_distributions(
            id, period_start, period_end, total_profit,
            plan:profit_sharing_plans(id, name)
          )
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalGross = allocations?.reduce((sum, a) => sum + a.gross_amount, 0) || 0;
      const totalVested = allocations?.reduce((sum, a) => sum + a.vested_amount, 0) || 0;
      const totalPaid = allocations?.filter(a => a.status === 'paid').reduce((sum, a) => sum + a.vested_amount, 0) || 0;

      return NextResponse.json({
        allocations,
        summary: {
          total_gross: totalGross,
          total_vested: totalVested,
          total_paid: totalPaid,
          pending_vesting: totalGross - totalVested,
        },
      });
    }

    if (type === 'forecast') {
      // Forecast profit sharing based on current profit projections
      const { data: plans } = await supabase
        .from('profit_sharing_plans')
        .select('*')
        .eq('status', 'active');

      const { data: employees } = await supabase
        .from('platform_users')
        .select('id, salary, hire_date, department_id')
        .eq('status', 'active');

      const projectedProfit = parseFloat(searchParams.get('projected_profit') || '0');
      
      const forecasts = plans?.map(plan => {
        const eligibleEmployees = employees?.filter(e => {
          const criteria = plan.eligibility_criteria as any;
          if (!criteria) return true;
          
          if (criteria.min_tenure_months) {
            const tenureMonths = (Date.now() - new Date(e.hire_date).getTime()) / (30.44 * 24 * 60 * 60 * 1000);
            if (tenureMonths < criteria.min_tenure_months) return false;
          }
          
          if (criteria.departments?.length && !criteria.departments.includes(e.department_id)) {
            return false;
          }
          
          return true;
        }) || [];

        let poolAmount = 0;
        if (plan.plan_type === 'percentage_of_profit') {
          const threshold = plan.profit_threshold || 0;
          if (projectedProfit > threshold) {
            poolAmount = (projectedProfit - threshold) * ((plan as any).distribution_rate || 0.1);
          }
        }

        const perEmployeeAmount = eligibleEmployees.length > 0 ? poolAmount / eligibleEmployees.length : 0;

        return {
          plan_id: plan.id,
          plan_name: plan.name,
          projected_pool: poolAmount,
          eligible_employees: eligibleEmployees.length,
          average_per_employee: Math.round(perEmployeeAmount * 100) / 100,
        };
      });

      return NextResponse.json({
        forecasts,
        projected_profit: projectedProfit,
      });
    }

    // Default: return summary
    const { data: plans } = await supabase
      .from('profit_sharing_plans')
      .select('id')
      .eq('status', 'active');

    const currentYear = new Date().getFullYear();
    const { data: distributions } = await supabase
      .from('profit_sharing_distributions')
      .select('distribution_amount')
      .gte('period_start', `${currentYear}-01-01`);

    return NextResponse.json({
      summary: {
        active_plans: plans?.length || 0,
        ytd_distributions: distributions?.reduce((sum, d) => sum + d.distribution_amount, 0) || 0,
      },
    });
  } catch (error: any) {
    console.error('Profit sharing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create plan or distribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_plan') {
      const validated = profitSharingPlanSchema.parse(body.data);

      const { data: plan, error } = await supabase
        .from('profit_sharing_plans')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ plan }, { status: 201 });
    }

    if (action === 'create_distribution') {
      const validated = distributionSchema.parse(body.data);

      // Get plan details
      const { data: plan } = await supabase
        .from('profit_sharing_plans')
        .select('*')
        .eq('id', validated.plan_id)
        .single();

      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      // Calculate distribution amount
      const threshold = plan.profit_threshold || 0;
      const distributableProfit = Math.max(0, validated.total_profit - threshold);
      const distributionAmount = distributableProfit * (validated.distribution_percentage / 100);

      // Create distribution record
      const { data: distribution, error } = await supabase
        .from('profit_sharing_distributions')
        .insert({
          plan_id: validated.plan_id,
          period_start: validated.period_start,
          period_end: validated.period_end,
          total_profit: validated.total_profit,
          distribution_percentage: validated.distribution_percentage,
          distribution_amount: distributionAmount,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ distribution }, { status: 201 });
    }

    if (action === 'calculate_allocations') {
      const { distribution_id } = body.data;

      // Get distribution and plan
      const { data: distribution } = await supabase
        .from('profit_sharing_distributions')
        .select(`
          *,
          plan:profit_sharing_plans(*)
        `)
        .eq('id', distribution_id)
        .single();

      if (!distribution) {
        return NextResponse.json({ error: 'Distribution not found' }, { status: 404 });
      }

      const plan = distribution.plan as any;

      // Get eligible employees
      const { data: employees } = await supabase
        .from('platform_users')
        .select('id, salary, hire_date, department_id')
        .eq('status', 'active');

      const eligibleEmployees = employees?.filter(e => {
        const criteria = plan.eligibility_criteria as any;
        if (!criteria) return true;
        
        if (criteria.min_tenure_months) {
          const tenureMonths = (Date.now() - new Date(e.hire_date).getTime()) / (30.44 * 24 * 60 * 60 * 1000);
          if (tenureMonths < criteria.min_tenure_months) return false;
        }
        
        return true;
      }) || [];

      // Calculate allocations based on method
      const allocations = [];
      const totalPool = distribution.distribution_amount;

      if (plan.allocation_method === 'equal') {
        const perEmployee = totalPool / eligibleEmployees.length;
        for (const emp of eligibleEmployees) {
          allocations.push({
            distribution_id,
            employee_id: emp.id,
            gross_amount: Math.round(perEmployee * 100) / 100,
            vested_amount: Math.round(perEmployee * 100) / 100, // Simplified - would apply vesting
            status: 'pending',
            created_at: new Date().toISOString(),
          });
        }
      } else if (plan.allocation_method === 'salary_weighted') {
        const totalSalary = eligibleEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
        for (const emp of eligibleEmployees) {
          const weight = totalSalary > 0 ? (emp.salary || 0) / totalSalary : 1 / eligibleEmployees.length;
          const amount = totalPool * weight;
          allocations.push({
            distribution_id,
            employee_id: emp.id,
            gross_amount: Math.round(amount * 100) / 100,
            vested_amount: Math.round(amount * 100) / 100,
            status: 'pending',
            created_at: new Date().toISOString(),
          });
        }
      }

      // Insert allocations
      const { data: createdAllocations, error } = await supabase
        .from('profit_sharing_allocations')
        .insert(allocations)
        .select();

      if (error) throw error;

      // Update distribution status
      await supabase
        .from('profit_sharing_distributions')
        .update({ status: 'allocated', updated_at: new Date().toISOString() })
        .eq('id', distribution_id);

      return NextResponse.json({
        allocations: createdAllocations,
        total_allocated: allocations.reduce((sum, a) => sum + a.gross_amount, 0),
        participant_count: allocations.length,
      });
    }

    if (action === 'approve_distribution') {
      const { distribution_id, approved_by } = body.data;

      await supabase
        .from('profit_sharing_distributions')
        .update({
          status: 'approved',
          approved_by,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', distribution_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'process_payments') {
      const { distribution_id } = body.data;

      // Update all allocations to paid
      await supabase
        .from('profit_sharing_allocations')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('distribution_id', distribution_id);

      await supabase
        .from('profit_sharing_distributions')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', distribution_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Profit sharing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update plan or allocation
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'plan') {
      const { data: plan, error } = await supabase
        .from('profit_sharing_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ plan });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Profit sharing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deactivate plan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profit_sharing_plans')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Profit sharing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
