import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Validation schemas
const availabilitySchema = z.object({
  employee_id: z.string().uuid(),
  day_of_week: z.number().min(0).max(6).optional(),
  start_time: z.string(),
  end_time: z.string(),
  is_available: z.boolean().default(true),
  recurring: z.boolean().default(true),
  effective_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const blackoutSchema = z.object({
  employee_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  reason: z.enum(['holiday', 'company_event', 'maintenance', 'personal', 'vacation', 'other']),
  description: z.string().optional(),
  is_company_wide: z.boolean().default(false),
});

// GET - Get availability data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'schedule' | 'blackouts' | 'employee' | 'conflicts' | 'calendar'
    const employeeId = searchParams.get('employee_id');
    const departmentId = searchParams.get('department_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (type === 'schedule') {
      // Get recurring availability schedules
      let query = supabase
        .from('availability_schedules')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name, department_id)
        `)
        .eq('status', 'active');

      if (employeeId) query = query.eq('employee_id', employeeId);

      const { data: schedules, error } = await query;

      if (error) throw error;

      // Group by employee
      const byEmployee = schedules?.reduce((acc: Record<string, any>, s) => {
        const empId = s.employee_id;
        if (!acc[empId]) {
          acc[empId] = {
            employee: s.employee,
            schedule: [],
          };
        }
        acc[empId].schedule.push({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          is_available: s.is_available,
        });
        return acc;
      }, {});

      return NextResponse.json({
        schedules,
        by_employee: byEmployee,
      });
    }

    if (type === 'blackouts') {
      // Get blackout dates
      let query = supabase
        .from('blackout_dates')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name),
          department:departments(id, name)
        `)
        .order('start_date', { ascending: true });

      if (employeeId) query = query.eq('employee_id', employeeId);
      if (departmentId) query = query.eq('department_id', departmentId);
      if (startDate) query = query.gte('start_date', startDate);
      if (endDate) query = query.lte('end_date', endDate);

      const { data: blackouts, error } = await query;

      if (error) throw error;

      // Separate company-wide and individual blackouts
      const companyWide = blackouts?.filter(b => b.is_company_wide) || [];
      const individual = blackouts?.filter(b => !b.is_company_wide) || [];

      return NextResponse.json({
        blackouts,
        company_wide: companyWide,
        individual,
      });
    }

    if (type === 'employee' && employeeId) {
      // Get complete availability for an employee
      const [schedulesResult, blackoutsResult, ptoResult] = await Promise.all([
        supabase
          .from('availability_schedules')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('status', 'active'),
        supabase
          .from('blackout_dates')
          .select('*')
          .or(`employee_id.eq.${employeeId},is_company_wide.eq.true`)
          .gte('end_date', new Date().toISOString()),
        supabase
          .from('time_off_requests')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('status', 'approved')
          .gte('end_date', new Date().toISOString()),
      ]);

      return NextResponse.json({
        schedule: schedulesResult.data,
        blackouts: blackoutsResult.data,
        approved_time_off: ptoResult.data,
      });
    }

    if (type === 'conflicts') {
      // Check for scheduling conflicts
      const checkDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const checkStart = searchParams.get('start_time');
      const checkEnd = searchParams.get('end_time');

      if (!employeeId) {
        return NextResponse.json({ error: 'employee_id is required' }, { status: 400 });
      }

      const conflicts = [];

      // Check blackouts
      const { data: blackouts } = await supabase
        .from('blackout_dates')
        .select('*')
        .or(`employee_id.eq.${employeeId},is_company_wide.eq.true`)
        .lte('start_date', checkDate)
        .gte('end_date', checkDate);

      if (blackouts?.length) {
        conflicts.push({
          type: 'blackout',
          items: blackouts,
        });
      }

      // Check PTO
      const { data: pto } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('status', 'approved')
        .lte('start_date', checkDate)
        .gte('end_date', checkDate);

      if (pto?.length) {
        conflicts.push({
          type: 'time_off',
          items: pto,
        });
      }

      // Check existing shifts
      const { data: shifts } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', checkDate);

      if (shifts?.length && checkStart && checkEnd) {
        const overlapping = shifts.filter(s => {
          return (checkStart < s.end_time && checkEnd > s.start_time);
        });
        if (overlapping.length) {
          conflicts.push({
            type: 'existing_shift',
            items: overlapping,
          });
        }
      }

      // Check regular availability
      const dayOfWeek = new Date(checkDate).getDay();
      const { data: availability } = await supabase
        .from('availability_schedules')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('day_of_week', dayOfWeek)
        .eq('status', 'active');

      const isAvailable = availability?.some(a => {
        if (!checkStart || !checkEnd) return a.is_available;
        return a.is_available && checkStart >= a.start_time && checkEnd <= a.end_time;
      });

      if (!isAvailable && availability?.length) {
        conflicts.push({
          type: 'outside_availability',
          items: availability,
        });
      }

      return NextResponse.json({
        date: checkDate,
        has_conflicts: conflicts.length > 0,
        conflicts,
        is_available: conflicts.length === 0,
      });
    }

    if (type === 'calendar') {
      // Get calendar view of availability
      const month = searchParams.get('month') || new Date().toISOString().substring(0, 7);
      const monthStart = `${month}-01`;
      const monthEnd = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).toISOString().split('T')[0];

      // Get all relevant data
      const [blackoutsResult, ptoResult, shiftsResult] = await Promise.all([
        supabase
          .from('blackout_dates')
          .select('*')
          .or(`start_date.lte.${monthEnd},end_date.gte.${monthStart}`),
        supabase
          .from('time_off_requests')
          .select('employee_id, start_date, end_date, type')
          .eq('status', 'approved')
          .or(`start_date.lte.${monthEnd},end_date.gte.${monthStart}`),
        employeeId ? supabase
          .from('shifts')
          .select('*')
          .eq('employee_id', employeeId)
          .gte('date', monthStart)
          .lte('date', monthEnd) : Promise.resolve({ data: [] }),
      ]);

      // Build calendar
      const calendar: Record<string, any> = {};
      const startDateObj = new Date(monthStart);
      const endDateObj = new Date(monthEnd);

      for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        calendar[dateStr] = {
          date: dateStr,
          day_of_week: d.getDay(),
          blackouts: [],
          time_off: [],
          shifts: [],
        };
      }

      // Add blackouts
      blackoutsResult.data?.forEach(b => {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        const loopEnd = new Date(Math.min(end.getTime(), endDateObj.getTime()));
        for (let d = new Date(Math.max(start.getTime(), startDateObj.getTime())); 
             d <= loopEnd; 
             d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (calendar[dateStr]) {
            calendar[dateStr].blackouts.push(b);
          }
        }
      });

      // Add PTO
      ptoResult.data?.forEach(p => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        const loopEnd = new Date(Math.min(end.getTime(), endDateObj.getTime()));
        for (let d = new Date(Math.max(start.getTime(), startDateObj.getTime())); 
             d <= loopEnd; 
             d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (calendar[dateStr]) {
            calendar[dateStr].time_off.push(p);
          }
        }
      });

      // Add shifts
      (shiftsResult as any).data?.forEach((s: any) => {
        if (calendar[s.date]) {
          calendar[s.date].shifts.push(s);
        }
      });

      return NextResponse.json({
        month,
        calendar: Object.values(calendar),
      });
    }

    // Default: return summary
    const { data: blackouts } = await supabase
      .from('blackout_dates')
      .select('id')
      .gte('end_date', new Date().toISOString());

    const { data: schedules } = await supabase
      .from('availability_schedules')
      .select('employee_id')
      .eq('status', 'active');

    const uniqueEmployees = new Set(schedules?.map(s => s.employee_id));

    return NextResponse.json({
      summary: {
        active_blackouts: blackouts?.length || 0,
        employees_with_schedules: uniqueEmployees.size,
      },
    });
  } catch (error: any) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create availability or blackout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'set_availability') {
      const validated = availabilitySchema.parse(body.data);

      // If recurring, check for existing entry for same day
      if (validated.recurring && validated.day_of_week !== undefined) {
        await supabase
          .from('availability_schedules')
          .update({ status: 'inactive' })
          .eq('employee_id', validated.employee_id)
          .eq('day_of_week', validated.day_of_week);
      }

      const { data: availability, error } = await supabase
        .from('availability_schedules')
        .insert({
          ...validated,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ availability }, { status: 201 });
    }

    if (action === 'set_weekly_schedule') {
      // Set entire weekly schedule at once
      const { employee_id, schedule } = body.data;

      // Deactivate existing schedule
      await supabase
        .from('availability_schedules')
        .update({ status: 'inactive' })
        .eq('employee_id', employee_id);

      // Insert new schedule
      const scheduleRecords = schedule.map((s: any) => ({
        employee_id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_available: s.is_available !== false,
        recurring: true,
        status: 'active',
        created_at: new Date().toISOString(),
      }));

      const { data: newSchedule, error } = await supabase
        .from('availability_schedules')
        .insert(scheduleRecords)
        .select();

      if (error) throw error;

      return NextResponse.json({ schedule: newSchedule }, { status: 201 });
    }

    if (action === 'create_blackout') {
      const validated = blackoutSchema.parse(body.data);

      const { data: blackout, error } = await supabase
        .from('blackout_dates')
        .insert({
          ...validated,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ blackout }, { status: 201 });
    }

    if (action === 'bulk_blackout') {
      // Create blackout for multiple employees
      const { employee_ids, start_date, end_date, reason, description } = body.data;

      const blackoutRecords = employee_ids.map((empId: string) => ({
        employee_id: empId,
        start_date,
        end_date,
        reason,
        description,
        is_company_wide: false,
        created_at: new Date().toISOString(),
      }));

      const { data: blackouts, error } = await supabase
        .from('blackout_dates')
        .insert(blackoutRecords)
        .select();

      if (error) throw error;

      return NextResponse.json({ 
        blackouts, 
        count: blackouts?.length 
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Availability error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update availability or blackout
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (type === 'availability') {
      const { data: availability, error } = await supabase
        .from('availability_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ availability });
    }

    if (type === 'blackout') {
      const { data: blackout, error } = await supabase
        .from('blackout_dates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ blackout });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove availability or blackout
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'id and type are required' }, { status: 400 });
    }

    if (type === 'availability') {
      const { error } = await supabase
        .from('availability_schedules')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;
    } else if (type === 'blackout') {
      const { error } = await supabase
        .from('blackout_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Availability error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
