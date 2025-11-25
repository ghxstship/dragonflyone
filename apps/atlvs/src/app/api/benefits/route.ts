import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const benefitPlanSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['health', 'dental', 'vision', 'life', 'disability', 'retirement', 'pto', 'other']),
  provider: z.string().optional(),
  description: z.string().optional(),
  cost_employee_monthly: z.number().nonnegative(),
  cost_employer_monthly: z.number().nonnegative(),
  coverage_details: z.object({
    individual: z.boolean().optional(),
    family: z.boolean().optional(),
    spouse: z.boolean().optional(),
    dependents: z.boolean().optional()
  }).optional(),
  eligibility_criteria: z.object({
    employment_type: z.array(z.string()).optional(),
    min_hours_per_week: z.number().optional(),
    waiting_period_days: z.number().optional()
  }).optional(),
  active: z.boolean().default(true)
});

const enrollmentSchema = z.object({
  employee_id: z.string().uuid(),
  benefit_plan_id: z.string().uuid(),
  coverage_type: z.enum(['individual', 'family', 'spouse', 'dependents']),
  start_date: z.string(),
  end_date: z.string().optional(),
  status: z.enum(['active', 'pending', 'terminated', 'declined']),
  dependents: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    date_of_birth: z.string()
  })).optional()
});

// GET - List benefit plans or enrollments
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'plans' or 'enrollments'
    const employee_id = searchParams.get('employee_id');
    const active_only = searchParams.get('active') === 'true';

    if (type === 'enrollments') {
      let query = supabase
        .from('benefit_enrollments')
        .select(`
          *,
          benefit_plans (*),
          employees (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (employee_id) {
        query = query.eq('employee_id', employee_id);
      }

      if (active_only) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ enrollments: data });
    }

    // Default: list benefit plans
    let query = supabase
      .from('benefit_plans')
      .select('*')
      .order('name', { ascending: true });

    if (active_only) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: data });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'benefits:list', resource: 'benefits' }
  }
);

// POST - Create benefit plan or enrollment
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { type } = body;

    if (type === 'enrollment') {
      const validated = enrollmentSchema.parse(body.data);

      // Check eligibility
      const { data: employee } = await supabase
        .from('employees')
        .select('*, benefit_plans!benefit_enrollments(*)').eq('id', validated.employee_id)
        .single();

      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }

      // Create enrollment
      const { data: enrollment, error } = await supabase
        .from('benefit_enrollments')
        .insert({
          ...validated,
          enrolled_by: context.user.id,
          enrollment_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        enrollment,
        message: 'Employee enrolled successfully' 
      }, { status: 201 });
    }

    // Create benefit plan
    const validated = benefitPlanSchema.parse(body.data || body);

    const { data: plan, error } = await supabase
      .from('benefit_plans')
      .insert({
        ...validated,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      plan,
      message: 'Benefit plan created successfully' 
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'benefits:create', resource: 'benefits' }
  }
);

// PUT - Update benefit plan or enrollment
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, type, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const table = type === 'enrollment' ? 'benefit_enrollments' : 'benefit_plans';

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data,
      message: `${type === 'enrollment' ? 'Enrollment' : 'Benefit plan'} updated successfully` 
    });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'benefits:update', resource: 'benefits' }
  }
);

// DELETE - Deactivate benefit plan or terminate enrollment
export const DELETE = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'enrollment') {
      const { error } = await supabase
        .from('benefit_enrollments')
        .update({ 
          status: 'terminated',
          end_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Enrollment terminated successfully' });
    }

    // Deactivate benefit plan
    const { error } = await supabase
      .from('benefit_plans')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Benefit plan deactivated successfully' });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'benefits:delete', resource: 'benefits' }
  }
);
