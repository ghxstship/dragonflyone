export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const recordCompletionSchema = z.object({
  action: z.literal('record_completion'),
  employee_id: z.string().uuid(),
  course_id: z.string().uuid(),
  score: z.number().optional(),
  certificate_url: z.string().url().optional(),
});

const createCourseSchema = z.object({
  action: z.literal('create_course'),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  duration_minutes: z.number().optional(),
  validity_months: z.number().optional(),
  is_required: z.boolean().optional(),
  content_url: z.string().url().optional(),
});

const complianceTrainingActionSchema = z.discriminatedUnion('action', [
  recordCompletionSchema,
  createCourseSchema,
]);

// Compliance training completion and certification
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = complianceTrainingActionSchema.parse(body);

    if (validatedData.action === 'record_completion') {
      const { employee_id, course_id, score, certificate_url } = validatedData;

      const { data: course } = await supabase.from('compliance_courses').select('validity_months').eq('id', course_id).single();
      
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (course?.validity_months || 12));

      const { data, error } = await supabase.from('training_completions').insert({
        employee_id, course_id, score, certificate_url,
        completed_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        recorded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ completion: data }, { status: 201 });
    }

    if (validatedData.action === 'create_course') {
      const { name, description, category, duration_minutes, validity_months, is_required, content_url } = validatedData;

      const { data, error } = await supabase.from('compliance_courses').insert({
        name, description, category, duration_minutes, validity_months,
        is_required: is_required || false, content_url, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ course: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
