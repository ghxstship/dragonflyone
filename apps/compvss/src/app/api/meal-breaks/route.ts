import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const breakSchema = z.object({
  timesheet_id: z.string().uuid(),
  type: z.enum(['meal', 'rest']),
  start_time: z.string(),
  end_time: z.string(),
  waived: z.boolean().default(false),
  waiver_reason: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timesheetId = searchParams.get('timesheet_id');
    const employeeId = searchParams.get('employee_id');
    const date = searchParams.get('date');
    const type = searchParams.get('type');

    if (type === 'compliance') {
      // Check meal break compliance
      const startDate = searchParams.get('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

      const { data: timesheets } = await supabase
        .from('timesheets')
        .select(`
          id,
          employee_id,
          date,
          hours,
          breaks:timesheet_breaks(*)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'approved');

      const violations: any[] = [];

      timesheets?.forEach(ts => {
        const breaks = (ts.breaks as any[]) || [];
        const mealBreaks = breaks.filter(b => b.type === 'meal');
        const restBreaks = breaks.filter(b => b.type === 'rest');

        // Check meal break requirement (typically required for shifts > 5 hours)
        if (ts.hours > 5 && mealBreaks.length === 0) {
          violations.push({
            timesheet_id: ts.id,
            employee_id: ts.employee_id,
            date: ts.date,
            violation_type: 'missing_meal_break',
            hours_worked: ts.hours,
          });
        }

        // Check meal break duration (typically 30 min minimum)
        mealBreaks.forEach(mb => {
          if (mb.duration_minutes < 30 && !mb.waived) {
            violations.push({
              timesheet_id: ts.id,
              employee_id: ts.employee_id,
              date: ts.date,
              violation_type: 'short_meal_break',
              duration: mb.duration_minutes,
            });
          }
        });

        // Check rest break requirement (typically 10 min per 4 hours)
        const expectedRestBreaks = Math.floor(ts.hours / 4);
        if (restBreaks.length < expectedRestBreaks) {
          violations.push({
            timesheet_id: ts.id,
            employee_id: ts.employee_id,
            date: ts.date,
            violation_type: 'insufficient_rest_breaks',
            expected: expectedRestBreaks,
            actual: restBreaks.length,
          });
        }
      });

      return NextResponse.json({
        compliance_report: {
          period: { start: startDate, end: endDate },
          total_timesheets: timesheets?.length || 0,
          violations_count: violations.length,
          compliance_rate: timesheets?.length 
            ? Math.round(((timesheets.length - violations.length) / timesheets.length) * 10000) / 100 
            : 100,
        },
        violations,
      });
    }

    let query = supabase
      .from('timesheet_breaks')
      .select(`
        *,
        timesheet:timesheets(id, employee_id, date, hours)
      `)
      .order('start_time', { ascending: true });

    if (timesheetId) query = query.eq('timesheet_id', timesheetId);

    const { data: breaks, error } = await query;
    if (error) throw error;

    return NextResponse.json({ breaks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = breakSchema.parse(body);

    // Calculate duration
    const start = new Date(`2000-01-01T${validated.start_time}`);
    const end = new Date(`2000-01-01T${validated.end_time}`);
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    const { data: breakRecord, error } = await supabase
      .from('timesheet_breaks')
      .insert({
        ...validated,
        duration_minutes: durationMinutes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ break: breakRecord }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // Recalculate duration if times changed
    if (updates.start_time && updates.end_time) {
      const start = new Date(`2000-01-01T${updates.start_time}`);
      const end = new Date(`2000-01-01T${updates.end_time}`);
      updates.duration_minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }

    const { data: breakRecord, error } = await supabase
      .from('timesheet_breaks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ break: breakRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('timesheet_breaks').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
