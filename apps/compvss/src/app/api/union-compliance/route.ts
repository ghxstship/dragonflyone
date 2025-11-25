import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch union compliance data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const unionLocal = searchParams.get('union_local');

    let query = supabase
      .from('union_compliance')
      .select(`
        *,
        project:projects(id, name),
        crew_members:union_crew_assignments(
          crew:platform_users(id, email, first_name, last_name),
          role,
          call_time,
          wrap_time,
          hours_worked,
          overtime_hours,
          meal_breaks
        )
      `);

    if (projectId) query = query.eq('project_id', projectId);
    if (unionLocal) query = query.eq('union_local', unionLocal);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate compliance status for each record
    const complianceData = data.map(record => ({
      ...record,
      compliance_status: calculateComplianceStatus(record),
    }));

    return NextResponse.json({
      compliance_records: complianceData,
      union_locals: Array.from(new Set(data.map(d => d.union_local))),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}

// POST - Create union compliance record
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      project_id,
      union_local, // 'IATSE Local 500', 'IBEW Local 349', etc.
      agreement_type, // 'pink_contract', 'yellow_card', 'white_card', 'custom'
      work_date,
      call_time,
      first_meal_break,
      second_meal_break,
      wrap_time,
      minimum_call_hours,
      overtime_after_hours,
      double_time_after_hours,
      meal_penalty_minutes,
      turnaround_hours,
      crew_assignments,
      special_provisions,
      notes,
    } = body;

    // Create compliance record
    const { data: compliance, error: complianceError } = await supabase
      .from('union_compliance')
      .insert({
        project_id,
        union_local,
        agreement_type,
        work_date,
        call_time,
        first_meal_break,
        second_meal_break,
        wrap_time,
        minimum_call_hours: minimum_call_hours || 8,
        overtime_after_hours: overtime_after_hours || 8,
        double_time_after_hours: double_time_after_hours || 12,
        meal_penalty_minutes: meal_penalty_minutes || 360,
        turnaround_hours: turnaround_hours || 10,
        special_provisions: special_provisions || [],
        notes,
        status: 'active',
        created_by: user.id,
      })
      .select()
      .single();

    if (complianceError) {
      return NextResponse.json({ error: complianceError.message }, { status: 500 });
    }

    // Add crew assignments
    if (crew_assignments && crew_assignments.length > 0) {
      const assignmentRecords = crew_assignments.map((assignment: any) => ({
        compliance_id: compliance.id,
        crew_id: assignment.crew_id,
        role: assignment.role,
        department: assignment.department,
        call_time: assignment.call_time || call_time,
        union_member_id: assignment.union_member_id,
      }));

      await supabase.from('union_crew_assignments').insert(assignmentRecords);
    }

    return NextResponse.json({ compliance }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create compliance record' },
      { status: 500 }
    );
  }
}

// PATCH - Update compliance record or log time
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { compliance_id, assignment_id, action, ...updateData } = body;

    if (assignment_id) {
      // Update crew assignment (log time, breaks, etc.)
      const { wrap_time, meal_breaks } = updateData;

      // Calculate hours and overtime
      const { data: assignment } = await supabase
        .from('union_crew_assignments')
        .select('*, compliance:union_compliance(*)')
        .eq('id', assignment_id)
        .single();

      if (assignment && wrap_time) {
        const callTime = new Date(`1970-01-01T${assignment.call_time}`);
        const wrapTime = new Date(`1970-01-01T${wrap_time}`);
        const hoursWorked = (wrapTime.getTime() - callTime.getTime()) / (1000 * 60 * 60);

        const compliance = assignment.compliance;
        const overtimeHours = Math.max(0, hoursWorked - compliance.overtime_after_hours);
        const doubleTimeHours = Math.max(0, hoursWorked - compliance.double_time_after_hours);

        // Check meal penalty
        let mealPenalty = false;
        if (meal_breaks && meal_breaks.length > 0) {
          const firstBreak = new Date(`1970-01-01T${meal_breaks[0]}`);
          const minutesToFirstBreak = (firstBreak.getTime() - callTime.getTime()) / (1000 * 60);
          if (minutesToFirstBreak > compliance.meal_penalty_minutes) {
            mealPenalty = true;
          }
        }

        await supabase
          .from('union_crew_assignments')
          .update({
            wrap_time,
            hours_worked: hoursWorked,
            overtime_hours: overtimeHours,
            double_time_hours: doubleTimeHours,
            meal_breaks: meal_breaks || [],
            meal_penalty: mealPenalty,
          })
          .eq('id', assignment_id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'finalize') {
      // Check all crew have logged time
      const { data: assignments } = await supabase
        .from('union_crew_assignments')
        .select('*')
        .eq('compliance_id', compliance_id)
        .is('wrap_time', null);

      if (assignments && assignments.length > 0) {
        return NextResponse.json({
          error: 'Cannot finalize: some crew members have not logged wrap time',
          missing_count: assignments.length,
        }, { status: 400 });
      }

      await supabase
        .from('union_compliance')
        .update({
          status: 'finalized',
          finalized_at: new Date().toISOString(),
          finalized_by: user.id,
        })
        .eq('id', compliance_id);

      return NextResponse.json({ success: true });
    }

    // Default: update compliance record
    const { error } = await supabase
      .from('union_compliance')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', compliance_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update compliance record' },
      { status: 500 }
    );
  }
}

function calculateComplianceStatus(record: any): {
  status: 'compliant' | 'warning' | 'violation';
  issues: string[];
} {
  const issues: string[] = [];

  if (record.crew_members) {
    for (const member of record.crew_members) {
      if (member.meal_penalty) {
        issues.push(`Meal penalty for ${member.crew?.first_name} ${member.crew?.last_name}`);
      }
      if (member.hours_worked > 16) {
        issues.push(`Excessive hours (${member.hours_worked}h) for ${member.crew?.first_name}`);
      }
    }
  }

  return {
    status: issues.length === 0 ? 'compliant' : issues.length <= 2 ? 'warning' : 'violation',
    issues,
  };
}
