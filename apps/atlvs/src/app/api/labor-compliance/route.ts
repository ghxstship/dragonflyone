import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Labor law rules by state
const STATE_LABOR_RULES: Record<string, {
  overtime_threshold: number;
  meal_break_required_after: number;
  meal_break_duration: number;
  rest_break_interval: number;
  rest_break_duration: number;
  daily_overtime_threshold?: number;
  double_time_threshold?: number;
}> = {
  CA: {
    overtime_threshold: 40,
    daily_overtime_threshold: 8,
    double_time_threshold: 12,
    meal_break_required_after: 5,
    meal_break_duration: 30,
    rest_break_interval: 4,
    rest_break_duration: 10,
  },
  NY: {
    overtime_threshold: 40,
    meal_break_required_after: 6,
    meal_break_duration: 30,
    rest_break_interval: 4,
    rest_break_duration: 10,
  },
  TX: {
    overtime_threshold: 40,
    meal_break_required_after: 0, // No state requirement
    meal_break_duration: 0,
    rest_break_interval: 0,
    rest_break_duration: 0,
  },
  // Default federal rules
  DEFAULT: {
    overtime_threshold: 40,
    meal_break_required_after: 0,
    meal_break_duration: 0,
    rest_break_interval: 0,
    rest_break_duration: 0,
  },
};

// Validation schemas
const timesheetValidationSchema = z.object({
  employee_id: z.string().uuid(),
  date: z.string().datetime(),
  hours_worked: z.number().positive(),
  breaks_taken: z.array(z.object({
    type: z.enum(['meal', 'rest']),
    start_time: z.string(),
    end_time: z.string(),
    duration_minutes: z.number(),
  })).optional(),
  state: z.string().length(2).optional(),
});

// GET - Get labor compliance data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'rules' | 'violations' | 'overtime' | 'breaks' | 'audit'
    const employeeId = searchParams.get('employee_id');
    const state = searchParams.get('state');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (type === 'rules') {
      // Get labor rules for a specific state or all states
      if (state) {
        const rules = STATE_LABOR_RULES[state] || STATE_LABOR_RULES.DEFAULT;
        return NextResponse.json({ state, rules });
      }
      return NextResponse.json({ rules: STATE_LABOR_RULES });
    }

    if (type === 'violations') {
      // Get compliance violations
      let query = supabase
        .from('labor_violations')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name, department_id)
        `)
        .order('violation_date', { ascending: false });

      if (employeeId) query = query.eq('employee_id', employeeId);
      if (state) query = query.eq('state', state);
      if (startDate) query = query.gte('violation_date', startDate);
      if (endDate) query = query.lte('violation_date', endDate);

      const { data: violations, error } = await query;

      if (error) throw error;

      // Group by type
      const byType = violations?.reduce((acc: Record<string, number>, v) => {
        acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
        return acc;
      }, {});

      return NextResponse.json({
        violations,
        by_type: byType,
        total: violations?.length || 0,
      });
    }

    if (type === 'overtime') {
      // Get overtime analysis
      const period = searchParams.get('period') || new Date().toISOString().substring(0, 7);
      const periodStart = `${period}-01`;
      const periodEnd = new Date(parseInt(period.split('-')[0]), parseInt(period.split('-')[1]), 0).toISOString().split('T')[0];

      const { data: timesheets, error } = await supabase
        .from('timesheets')
        .select(`
          employee_id,
          hours,
          date,
          employee:platform_users(id, first_name, last_name, work_state)
        `)
        .gte('date', periodStart)
        .lte('date', periodEnd)
        .eq('status', 'approved');

      if (error) throw error;

      // Calculate overtime by employee
      const employeeHours: Record<string, { 
        employee: any; 
        regular: number; 
        overtime: number; 
        double_time: number;
        daily_overtime: number;
      }> = {};

      timesheets?.forEach(ts => {
        const empId = ts.employee_id;
        const empState = (ts.employee as any)?.work_state || 'DEFAULT';
        const rules = STATE_LABOR_RULES[empState] || STATE_LABOR_RULES.DEFAULT;

        if (!employeeHours[empId]) {
          employeeHours[empId] = {
            employee: ts.employee,
            regular: 0,
            overtime: 0,
            double_time: 0,
            daily_overtime: 0,
          };
        }

        // Daily overtime (CA style)
        if (rules.daily_overtime_threshold) {
          if (ts.hours > (rules.double_time_threshold || 12)) {
            employeeHours[empId].double_time += ts.hours - (rules.double_time_threshold || 12);
            employeeHours[empId].daily_overtime += (rules.double_time_threshold || 12) - rules.daily_overtime_threshold;
            employeeHours[empId].regular += rules.daily_overtime_threshold;
          } else if (ts.hours > rules.daily_overtime_threshold) {
            employeeHours[empId].daily_overtime += ts.hours - rules.daily_overtime_threshold;
            employeeHours[empId].regular += rules.daily_overtime_threshold;
          } else {
            employeeHours[empId].regular += ts.hours;
          }
        } else {
          employeeHours[empId].regular += ts.hours;
        }
      });

      // Calculate weekly overtime
      Object.values(employeeHours).forEach(emp => {
        const rules = STATE_LABOR_RULES[(emp.employee as any)?.work_state] || STATE_LABOR_RULES.DEFAULT;
        if (emp.regular > rules.overtime_threshold) {
          emp.overtime = emp.regular - rules.overtime_threshold;
          emp.regular = rules.overtime_threshold;
        }
      });

      const overtimeReport = Object.values(employeeHours);

      return NextResponse.json({
        period,
        overtime_report: overtimeReport,
        summary: {
          total_regular: overtimeReport.reduce((sum, e) => sum + e.regular, 0),
          total_overtime: overtimeReport.reduce((sum, e) => sum + e.overtime, 0),
          total_daily_overtime: overtimeReport.reduce((sum, e) => sum + e.daily_overtime, 0),
          total_double_time: overtimeReport.reduce((sum, e) => sum + e.double_time, 0),
          employees_with_overtime: overtimeReport.filter(e => e.overtime > 0 || e.daily_overtime > 0).length,
        },
      });
    }

    if (type === 'breaks') {
      // Get break compliance
      const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

      const { data: timesheets, error } = await supabase
        .from('timesheets')
        .select(`
          *,
          employee:platform_users(id, first_name, last_name, work_state),
          breaks:timesheet_breaks(type, start_time, end_time, duration_minutes)
        `)
        .eq('date', date);

      if (error) throw error;

      const breakCompliance = timesheets?.map(ts => {
        const empState = (ts.employee as any)?.work_state || 'DEFAULT';
        const rules = STATE_LABOR_RULES[empState] || STATE_LABOR_RULES.DEFAULT;
        const breaks = (ts.breaks as any[]) || [];

        const mealBreaks = breaks.filter(b => b.type === 'meal');
        const restBreaks = breaks.filter(b => b.type === 'rest');

        const violations = [];

        // Check meal break compliance
        if (rules.meal_break_required_after > 0 && ts.hours >= rules.meal_break_required_after) {
          const totalMealMinutes = mealBreaks.reduce((sum, b) => sum + b.duration_minutes, 0);
          if (totalMealMinutes < rules.meal_break_duration) {
            violations.push({
              type: 'meal_break',
              required: rules.meal_break_duration,
              actual: totalMealMinutes,
              message: `Meal break required after ${rules.meal_break_required_after} hours`,
            });
          }
        }

        // Check rest break compliance
        if (rules.rest_break_interval > 0) {
          const requiredRestBreaks = Math.floor(ts.hours / rules.rest_break_interval);
          if (restBreaks.length < requiredRestBreaks) {
            violations.push({
              type: 'rest_break',
              required: requiredRestBreaks,
              actual: restBreaks.length,
              message: `Rest break required every ${rules.rest_break_interval} hours`,
            });
          }
        }

        return {
          employee_id: ts.employee_id,
          employee_name: `${(ts.employee as any)?.first_name} ${(ts.employee as any)?.last_name}`,
          date: ts.date,
          hours_worked: ts.hours,
          state: empState,
          meal_breaks: mealBreaks.length,
          rest_breaks: restBreaks.length,
          violations,
          compliant: violations.length === 0,
        };
      });

      return NextResponse.json({
        date,
        break_compliance: breakCompliance,
        summary: {
          total_employees: breakCompliance?.length || 0,
          compliant: breakCompliance?.filter(b => b.compliant).length || 0,
          violations: breakCompliance?.filter(b => !b.compliant).length || 0,
        },
      });
    }

    if (type === 'audit') {
      // Get compliance audit report
      const period = searchParams.get('period') || new Date().toISOString().substring(0, 7);

      const { data: violations } = await supabase
        .from('labor_violations')
        .select('violation_type, state, severity')
        .gte('violation_date', `${period}-01`)
        .lte('violation_date', `${period}-31`);

      const { data: employees } = await supabase
        .from('platform_users')
        .select('id, work_state')
        .eq('status', 'active');

      // Group violations by state
      const byState = violations?.reduce((acc: Record<string, number>, v) => {
        acc[v.state] = (acc[v.state] || 0) + 1;
        return acc;
      }, {});

      // Calculate compliance score
      const totalPossibleViolations = (employees?.length || 1) * 30; // Assume 30 days
      const actualViolations = violations?.length || 0;
      const complianceScore = Math.max(0, 100 - (actualViolations / totalPossibleViolations) * 100);

      return NextResponse.json({
        period,
        audit: {
          total_violations: actualViolations,
          by_state: byState,
          compliance_score: Math.round(complianceScore * 100) / 100,
          employees_audited: employees?.length || 0,
        },
      });
    }

    // Default: return summary
    const currentMonth = new Date().toISOString().substring(0, 7);
    const { data: violations } = await supabase
      .from('labor_violations')
      .select('id')
      .gte('violation_date', `${currentMonth}-01`);

    return NextResponse.json({
      summary: {
        violations_this_month: violations?.length || 0,
        states_configured: Object.keys(STATE_LABOR_RULES).length - 1, // Exclude DEFAULT
      },
    });
  } catch (error: any) {
    console.error('Labor compliance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Validate timesheet or log violation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'validate_timesheet') {
      const validated = timesheetValidationSchema.parse(body.data);
      const state = validated.state || 'DEFAULT';
      const rules = STATE_LABOR_RULES[state] || STATE_LABOR_RULES.DEFAULT;

      const violations = [];

      // Check daily overtime
      if (rules.daily_overtime_threshold && validated.hours_worked > rules.daily_overtime_threshold) {
        violations.push({
          type: 'daily_overtime',
          hours: validated.hours_worked - rules.daily_overtime_threshold,
          message: `Daily overtime: ${validated.hours_worked - rules.daily_overtime_threshold} hours over ${rules.daily_overtime_threshold} hour threshold`,
        });
      }

      // Check meal breaks
      if (rules.meal_break_required_after > 0 && validated.hours_worked >= rules.meal_break_required_after) {
        const mealBreaks = validated.breaks_taken?.filter(b => b.type === 'meal') || [];
        const totalMealMinutes = mealBreaks.reduce((sum, b) => sum + b.duration_minutes, 0);
        
        if (totalMealMinutes < rules.meal_break_duration) {
          violations.push({
            type: 'meal_break_missing',
            required: rules.meal_break_duration,
            actual: totalMealMinutes,
            message: `Meal break violation: ${rules.meal_break_duration} minutes required, ${totalMealMinutes} taken`,
          });
        }
      }

      // Check rest breaks
      if (rules.rest_break_interval > 0) {
        const requiredRestBreaks = Math.floor(validated.hours_worked / rules.rest_break_interval);
        const restBreaks = validated.breaks_taken?.filter(b => b.type === 'rest') || [];
        
        if (restBreaks.length < requiredRestBreaks) {
          violations.push({
            type: 'rest_break_missing',
            required: requiredRestBreaks,
            actual: restBreaks.length,
            message: `Rest break violation: ${requiredRestBreaks} breaks required, ${restBreaks.length} taken`,
          });
        }
      }

      return NextResponse.json({
        valid: violations.length === 0,
        violations,
        rules_applied: rules,
        state,
      });
    }

    if (action === 'log_violation') {
      const { employee_id, violation_type, violation_date, state, severity, description, timesheet_id } = body.data;

      const { data: violation, error } = await supabase
        .from('labor_violations')
        .insert({
          employee_id,
          violation_type,
          violation_date,
          state,
          severity: severity || 'medium',
          description,
          timesheet_id,
          status: 'open',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ violation }, { status: 201 });
    }

    if (action === 'resolve_violation') {
      const { violation_id, resolution_notes, resolved_by } = body.data;

      const { data: violation, error } = await supabase
        .from('labor_violations')
        .update({
          status: 'resolved',
          resolution_notes,
          resolved_by,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', violation_id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ violation });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Labor compliance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
