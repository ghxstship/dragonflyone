import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Overtime calculation with labor law compliance
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const weekStart = searchParams.get('week_start');

    const startDate = weekStart ? new Date(weekStart) : getWeekStart(new Date());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    let query = supabase.from('time_entries').select(`
      *, employee:employees(id, first_name, last_name, hourly_rate, state)
    `).gte('clock_in', startDate.toISOString()).lt('clock_in', endDate.toISOString());

    if (employeeId) query = query.eq('employee_id', employeeId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by employee and calculate overtime
    const byEmployee: Record<string, any[]> = {};
    data?.forEach(entry => {
      if (!byEmployee[entry.employee_id]) byEmployee[entry.employee_id] = [];
      byEmployee[entry.employee_id].push(entry);
    });

    const calculations = Object.entries(byEmployee).map(([empId, entries]) => {
      const employee = entries[0]?.employee;
      const state = employee?.state || 'default';
      const rules = getLaborRules(state);

      let totalHours = 0;
      let regularHours = 0;
      let overtimeHours = 0;
      let doubleTimeHours = 0;

      // Daily calculations for states like CA
      const byDay: Record<string, number> = {};
      entries.forEach(e => {
        const day = e.clock_in.substring(0, 10);
        const hours = e.hours_worked || 0;
        byDay[day] = (byDay[day] || 0) + hours;
        totalHours += hours;
      });

      if (rules.dailyOvertime) {
        Object.values(byDay).forEach(dayHours => {
          if (dayHours > rules.doubleTimeThreshold) {
            regularHours += 8;
            overtimeHours += rules.doubleTimeThreshold - 8;
            doubleTimeHours += dayHours - rules.doubleTimeThreshold;
          } else if (dayHours > rules.dailyOvertimeThreshold) {
            regularHours += rules.dailyOvertimeThreshold;
            overtimeHours += dayHours - rules.dailyOvertimeThreshold;
          } else {
            regularHours += dayHours;
          }
        });
      } else {
        // Weekly overtime only
        regularHours = Math.min(totalHours, rules.weeklyOvertimeThreshold);
        overtimeHours = Math.max(0, totalHours - rules.weeklyOvertimeThreshold);
      }

      const hourlyRate = employee?.hourly_rate || 0;
      return {
        employee_id: empId,
        employee_name: `${employee?.first_name} ${employee?.last_name}`,
        total_hours: Math.round(totalHours * 100) / 100,
        regular_hours: Math.round(regularHours * 100) / 100,
        overtime_hours: Math.round(overtimeHours * 100) / 100,
        double_time_hours: Math.round(doubleTimeHours * 100) / 100,
        regular_pay: regularHours * hourlyRate,
        overtime_pay: overtimeHours * hourlyRate * 1.5,
        double_time_pay: doubleTimeHours * hourlyRate * 2,
        total_pay: (regularHours * hourlyRate) + (overtimeHours * hourlyRate * 1.5) + (doubleTimeHours * hourlyRate * 2),
        state_rules: rules.name
      };
    });

    return NextResponse.json({
      week_start: startDate.toISOString(),
      calculations,
      totals: {
        total_hours: calculations.reduce((s, c) => s + c.total_hours, 0),
        total_overtime: calculations.reduce((s, c) => s + c.overtime_hours, 0),
        total_pay: calculations.reduce((s, c) => s + c.total_pay, 0)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate' }, { status: 500 });
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getLaborRules(state: string): any {
  const rules: Record<string, any> = {
    CA: { name: 'California', dailyOvertime: true, dailyOvertimeThreshold: 8, doubleTimeThreshold: 12, weeklyOvertimeThreshold: 40 },
    NY: { name: 'New York', dailyOvertime: false, weeklyOvertimeThreshold: 40 },
    default: { name: 'Federal', dailyOvertime: false, weeklyOvertimeThreshold: 40 }
  };
  return rules[state] || rules.default;
}
