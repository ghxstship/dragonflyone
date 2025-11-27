import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const ptoBalanceSchema = z.object({
  employee_id: z.string().uuid(),
  year: z.number().int().min(2020).max(2100),
  pto_type: z.enum(['vacation', 'sick', 'personal', 'floating_holiday']),
  accrued_hours: z.number().nonnegative(),
  carryover_hours: z.number().nonnegative().default(0),
  max_carryover: z.number().nonnegative().optional(),
});

// GET /api/pto-balances - Get PTO balances
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const departmentId = searchParams.get('department_id');

    let query = supabase
      .from('pto_balances')
      .select(`
        *,
        employee:employees(id, first_name, last_name, employee_number, department_id)
      `)
      .eq('year', parseInt(year))
      .order('pto_type', { ascending: true });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching PTO balances:', error);
      return NextResponse.json(
        { error: 'Failed to fetch PTO balances', details: error.message },
        { status: 500 }
      );
    }

    // Group by employee if no specific employee requested
    let result;
    if (employeeId) {
      result = { balances: data };
    } else {
      interface PTORecord {
        employee_id: string;
        pto_type: string;
        accrued_hours: number;
        used_hours: number;
        pending_hours: number;
        available_hours: number;
        employee?: { first_name: string; last_name: string; employee_number: string };
        [key: string]: unknown;
      }
      const balances = (data || []) as unknown as PTORecord[];
      
      const grouped = balances.reduce((acc, balance) => {
        if (!acc[balance.employee_id]) {
          acc[balance.employee_id] = {
            employee_id: balance.employee_id,
            employee: balance.employee,
            balances: {},
          };
        }
        acc[balance.employee_id].balances[balance.pto_type] = {
          accrued: balance.accrued_hours,
          used: balance.used_hours,
          pending: balance.pending_hours,
          available: balance.available_hours,
        };
        return acc;
      }, {} as Record<string, any>);

      result = { employees: Object.values(grouped) };
    }

    // Calculate summary
    interface PTORecord {
      pto_type: string;
      accrued_hours: number;
      used_hours: number;
      available_hours: number;
      [key: string]: unknown;
    }
    const allBalances = (data || []) as unknown as PTORecord[];
    
    const summary = {
      total_accrued: allBalances.reduce((sum, b) => sum + (b.accrued_hours || 0), 0),
      total_used: allBalances.reduce((sum, b) => sum + (b.used_hours || 0), 0),
      total_available: allBalances.reduce((sum, b) => sum + (b.available_hours || 0), 0),
      by_type: allBalances.reduce((acc, b) => {
        if (!acc[b.pto_type]) {
          acc[b.pto_type] = { accrued: 0, used: 0, available: 0 };
        }
        acc[b.pto_type].accrued += b.accrued_hours || 0;
        acc[b.pto_type].used += b.used_hours || 0;
        acc[b.pto_type].available += b.available_hours || 0;
        return acc;
      }, {} as Record<string, { accrued: number; used: number; available: number }>),
    };

    return NextResponse.json({ ...result, summary, year: parseInt(year) });
  } catch (error) {
    console.error('Error in GET /api/pto-balances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/pto-balances - Create or update PTO balance
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = ptoBalanceSchema.parse(body);

    // Upsert balance
    const { data: balance, error } = await supabase
      .from('pto_balances')
      .upsert({
        employee_id: validated.employee_id,
        year: validated.year,
        pto_type: validated.pto_type,
        accrued_hours: validated.accrued_hours,
        carryover_hours: validated.carryover_hours,
        max_carryover: validated.max_carryover,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'employee_id,year,pto_type',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating PTO balance:', error);
      return NextResponse.json(
        { error: 'Failed to create/update PTO balance', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(balance, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/pto-balances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/pto-balances - Bulk accrual or adjustment
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { action, employee_ids, pto_type, hours, year } = body;
    const currentYear = year || new Date().getFullYear();

    if (!action || !['accrue', 'adjust', 'carryover'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be accrue, adjust, or carryover' },
        { status: 400 }
      );
    }

    if (action === 'accrue') {
      // Bulk accrual for all or specific employees
      let employeeQuery = supabase
        .from('employees')
        .select('id')
        .eq('status', 'active');

      if (employee_ids && employee_ids.length > 0) {
        employeeQuery = employeeQuery.in('id', employee_ids);
      }

      const { data: employees } = await employeeQuery;

      if (!employees || employees.length === 0) {
        return NextResponse.json({ error: 'No employees found' }, { status: 404 });
      }

      const updates = [];
      for (const emp of employees) {
        // Get current balance
        const { data: currentBalance } = await supabase
          .from('pto_balances')
          .select('*')
          .eq('employee_id', emp.id)
          .eq('year', currentYear)
          .eq('pto_type', pto_type || 'vacation')
          .single();

        if (currentBalance) {
          // Update existing
          const { data } = await supabase
            .from('pto_balances')
            .update({
              accrued_hours: currentBalance.accrued_hours + hours,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentBalance.id)
            .select()
            .single();
          if (data) updates.push(data);
        } else {
          // Create new
          const { data } = await supabase
            .from('pto_balances')
            .insert({
              employee_id: emp.id,
              year: currentYear,
              pto_type: pto_type || 'vacation',
              accrued_hours: hours,
              used_hours: 0,
              pending_hours: 0,
            })
            .select()
            .single();
          if (data) updates.push(data);
        }
      }

      return NextResponse.json({
        success: true,
        action: 'accrue',
        updated: updates.length,
        hours_added: hours,
      });
    }

    if (action === 'carryover') {
      // Process year-end carryover
      const previousYear = currentYear - 1;

      const { data: previousBalances } = await supabase
        .from('pto_balances')
        .select('*')
        .eq('year', previousYear)
        .gt('available_hours', 0);

      if (!previousBalances || previousBalances.length === 0) {
        return NextResponse.json({ message: 'No balances to carry over' });
      }

      const carryovers = [];
      for (const balance of previousBalances) {
        const carryoverAmount = balance.max_carryover
          ? Math.min(balance.available_hours, balance.max_carryover)
          : balance.available_hours;

        if (carryoverAmount > 0) {
          const { data } = await supabase
            .from('pto_balances')
            .upsert({
              employee_id: balance.employee_id,
              year: currentYear,
              pto_type: balance.pto_type,
              accrued_hours: 0,
              carryover_hours: carryoverAmount,
              used_hours: 0,
              pending_hours: 0,
            }, {
              onConflict: 'employee_id,year,pto_type',
            })
            .select()
            .single();
          if (data) carryovers.push(data);
        }
      }

      return NextResponse.json({
        success: true,
        action: 'carryover',
        processed: carryovers.length,
        from_year: previousYear,
        to_year: currentYear,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/pto-balances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
