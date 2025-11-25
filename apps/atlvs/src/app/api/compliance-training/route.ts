import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Compliance training completion and certification
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const courseId = searchParams.get('course_id');

    // Get required training courses
    const { data: courses } = await supabase.from('compliance_courses').select('*').eq('is_required', true);

    let completionsQuery = supabase.from('training_completions').select(`
      *, course:compliance_courses(id, name, category, validity_months),
      employee:employees(id, first_name, last_name, department)
    `);

    if (employeeId) completionsQuery = completionsQuery.eq('employee_id', employeeId);
    if (courseId) completionsQuery = completionsQuery.eq('course_id', courseId);

    const { data: completions, error } = await completionsQuery;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate compliance status
    const { data: employees } = await supabase.from('employees').select('id, first_name, last_name');
    
    const complianceStatus = employees?.map(emp => {
      const empCompletions = completions?.filter(c => c.employee_id === emp.id) || [];
      const requiredCourses = courses || [];
      const completedCourseIds = empCompletions.map(c => c.course_id);
      const missingCourses = requiredCourses.filter(c => !completedCourseIds.includes(c.id));
      
      return {
        employee: emp,
        completed: empCompletions.length,
        required: requiredCourses.length,
        missing: missingCourses,
        compliant: missingCourses.length === 0
      };
    });

    return NextResponse.json({
      courses,
      completions,
      compliance_status: complianceStatus,
      overall_compliance: Math.round((complianceStatus?.filter(s => s.compliant).length || 0) / (complianceStatus?.length || 1) * 100)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch training data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'record_completion') {
      const { employee_id, course_id, score, certificate_url } = body;

      const { data: course } = await supabase.from('compliance_courses').select('validity_months').eq('id', course_id).single();
      
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (course?.validity_months || 12));

      const { data, error } = await supabase.from('training_completions').insert({
        employee_id, course_id, score, certificate_url,
        completed_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        recorded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ completion: data }, { status: 201 });
    }

    if (action === 'create_course') {
      const { name, description, category, duration_minutes, validity_months, is_required, content_url } = body;

      const { data, error } = await supabase.from('compliance_courses').insert({
        name, description, category, duration_minutes, validity_months,
        is_required: is_required || false, content_url, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ course: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
