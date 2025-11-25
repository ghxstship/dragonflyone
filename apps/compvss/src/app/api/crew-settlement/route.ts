import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const settlementSchema = z.object({
  crew_member_id: z.string().uuid(),
  event_id: z.string().uuid(),
  total_hours: z.number().min(0),
  regular_hours: z.number().min(0).optional(),
  overtime_hours: z.number().min(0).optional(),
  double_time_hours: z.number().min(0).optional(),
  hourly_rate: z.number().min(0),
  overtime_rate: z.number().min(0).optional(),
  per_diem: z.number().min(0).default(0),
  expenses: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const crewMemberId = searchParams.get('crew_member_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('crew_settlements')
      .select(`
        *,
        crew_member:platform_users(id, first_name, last_name, email),
        event:events(id, name, start_date)
      `)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (crewMemberId) query = query.eq('crew_member_id', crewMemberId);
    if (status) query = query.eq('status', status);

    const { data: settlements, error } = await query;
    if (error) throw error;

    // Calculate totals
    const totals = {
      total_gross: settlements?.reduce((sum, s) => sum + s.gross_pay, 0) || 0,
      total_net: settlements?.reduce((sum, s) => sum + s.net_pay, 0) || 0,
      total_hours: settlements?.reduce((sum, s) => sum + s.total_hours, 0) || 0,
      pending_count: settlements?.filter(s => s.status === 'pending').length || 0,
      approved_count: settlements?.filter(s => s.status === 'approved').length || 0,
      paid_count: settlements?.filter(s => s.status === 'paid').length || 0,
    };

    return NextResponse.json({ settlements, totals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'generate_from_timesheets') {
      const { event_id } = body.data;

      // Get all timesheets for the event
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select(`
          employee_id,
          hours,
          overtime_hours,
          date,
          employee:platform_users(id, hourly_rate)
        `)
        .eq('event_id', event_id)
        .eq('status', 'approved');

      // Aggregate by crew member
      const byCrewMember: Record<string, any> = {};
      timesheets?.forEach(ts => {
        const empId = ts.employee_id;
        if (!byCrewMember[empId]) {
          const emp = ts.employee as any;
          byCrewMember[empId] = {
            crew_member_id: empId,
            event_id,
            total_hours: 0,
            regular_hours: 0,
            overtime_hours: 0,
            hourly_rate: emp?.hourly_rate || 0,
          };
        }
        byCrewMember[empId].total_hours += ts.hours;
        byCrewMember[empId].regular_hours += ts.hours - (ts.overtime_hours || 0);
        byCrewMember[empId].overtime_hours += ts.overtime_hours || 0;
      });

      // Calculate pay for each
      const settlements = Object.values(byCrewMember).map((s: any) => {
        const overtimeRate = s.hourly_rate * 1.5;
        const regularPay = s.regular_hours * s.hourly_rate;
        const overtimePay = s.overtime_hours * overtimeRate;
        const grossPay = regularPay + overtimePay;

        return {
          ...s,
          overtime_rate: overtimeRate,
          gross_pay: Math.round(grossPay * 100) / 100,
          per_diem: 0,
          expenses: 0,
          deductions: 0,
          net_pay: Math.round(grossPay * 100) / 100,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
      });

      const { data, error } = await supabase
        .from('crew_settlements')
        .insert(settlements)
        .select();

      if (error) throw error;
      return NextResponse.json({ settlements: data, count: data?.length }, { status: 201 });
    }

    const validated = settlementSchema.parse(body);

    // Calculate pay
    const regularHours = validated.regular_hours || validated.total_hours;
    const overtimeHours = validated.overtime_hours || 0;
    const doubleTimeHours = validated.double_time_hours || 0;
    const overtimeRate = validated.overtime_rate || validated.hourly_rate * 1.5;
    const doubleTimeRate = validated.hourly_rate * 2;

    const regularPay = regularHours * validated.hourly_rate;
    const overtimePay = overtimeHours * overtimeRate;
    const doubleTimePay = doubleTimeHours * doubleTimeRate;
    const grossPay = regularPay + overtimePay + doubleTimePay + validated.per_diem + validated.expenses;
    const netPay = grossPay - validated.deductions;

    const { data: settlement, error } = await supabase
      .from('crew_settlements')
      .insert({
        ...validated,
        gross_pay: Math.round(grossPay * 100) / 100,
        net_pay: Math.round(netPay * 100) / 100,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ settlement }, { status: 201 });
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
    const { id, action, ...updates } = body;

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('crew_settlements')
        .update({
          status: 'approved',
          approved_by: updates.approved_by,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ settlement: data });
    }

    if (action === 'mark_paid') {
      const { data, error } = await supabase
        .from('crew_settlements')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ settlement: data });
    }

    if (action === 'bulk_approve') {
      const { settlement_ids, approved_by } = body;
      const { data, error } = await supabase
        .from('crew_settlements')
        .update({
          status: 'approved',
          approved_by,
          approved_at: new Date().toISOString(),
        })
        .in('id', settlement_ids)
        .select();
      if (error) throw error;
      return NextResponse.json({ settlements: data });
    }

    const { data, error } = await supabase
      .from('crew_settlements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ settlement: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
