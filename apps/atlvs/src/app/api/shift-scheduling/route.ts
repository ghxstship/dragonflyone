import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Advanced shift scheduling with conflict detection
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase.from('shifts').select(`
      *, employee:employees(id, first_name, last_name, department)
    `);

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (startDate) query = query.gte('shift_date', startDate);
    if (endDate) query = query.lte('shift_date', endDate);

    const { data, error } = await query.order('shift_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Detect conflicts
    const conflicts = detectShiftConflicts(data || []);

    return NextResponse.json({ shifts: data, conflicts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { employee_id, shift_date, start_time, end_time, department, role, notes } = body;

    // Check for conflicts
    const { data: existing } = await supabase.from('shifts').select('*')
      .eq('employee_id', employee_id).eq('shift_date', shift_date);

    const hasConflict = existing?.some(s => 
      (start_time >= s.start_time && start_time < s.end_time) ||
      (end_time > s.start_time && end_time <= s.end_time)
    );

    if (hasConflict) {
      return NextResponse.json({ error: 'Shift conflict detected', conflicts: existing }, { status: 400 });
    }

    const { data, error } = await supabase.from('shifts').insert({
      employee_id, shift_date, start_time, end_time, department, role, notes,
      status: 'scheduled', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ shift: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (action === 'swap') {
      const { target_shift_id } = updateData;
      const { data: shift1 } = await supabase.from('shifts').select('employee_id').eq('id', id).single();
      const { data: shift2 } = await supabase.from('shifts').select('employee_id').eq('id', target_shift_id).single();

      await supabase.from('shifts').update({ employee_id: shift2?.employee_id }).eq('id', id);
      await supabase.from('shifts').update({ employee_id: shift1?.employee_id }).eq('id', target_shift_id);

      return NextResponse.json({ success: true, message: 'Shifts swapped' });
    }

    const { error } = await supabase.from('shifts').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function detectShiftConflicts(shifts: any[]): any[] {
  const conflicts: any[] = [];
  const byEmployee = new Map<string, any[]>();

  shifts.forEach(s => {
    if (!byEmployee.has(s.employee_id)) byEmployee.set(s.employee_id, []);
    byEmployee.get(s.employee_id)!.push(s);
  });

  byEmployee.forEach((empShifts, empId) => {
    for (let i = 0; i < empShifts.length; i++) {
      for (let j = i + 1; j < empShifts.length; j++) {
        if (empShifts[i].shift_date === empShifts[j].shift_date) {
          if (empShifts[i].start_time < empShifts[j].end_time && empShifts[j].start_time < empShifts[i].end_time) {
            conflicts.push({ employee_id: empId, shifts: [empShifts[i], empShifts[j]] });
          }
        }
      }
    }
  });

  return conflicts;
}
