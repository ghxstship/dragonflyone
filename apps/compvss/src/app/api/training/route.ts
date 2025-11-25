import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const trainingModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(['safety', 'technical', 'equipment', 'soft_skills', 'compliance', 'leadership']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration_minutes: z.number().positive(),
  content_type: z.enum(['video', 'document', 'interactive', 'quiz', 'mixed']),
  content_url: z.string().url().optional(),
  prerequisites: z.array(z.string().uuid()).optional(),
  certification_required: z.boolean().default(false),
  passing_score: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  active: z.boolean().default(true)
});

const enrollmentSchema = z.object({
  module_id: z.string().uuid(),
  user_id: z.string().uuid(),
  assigned_by: z.string().uuid().optional(),
  due_date: z.string().optional(),
  mandatory: z.boolean().default(false)
});

const progressSchema = z.object({
  enrollment_id: z.string().uuid(),
  progress_percentage: z.number().min(0).max(100),
  time_spent_minutes: z.number().nonnegative(),
  quiz_score: z.number().min(0).max(100).optional(),
  completed: z.boolean().default(false)
});

// GET - List training modules or user enrollments
export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const user_id = searchParams.get('user_id') || context.user.id;
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    if (type === 'enrollments') {
      let query = supabase
        .from('training_enrollments')
        .select(`
          *,
          training_modules (
            id,
            title,
            category,
            difficulty,
            duration_minutes,
            certification_required
          ),
          progress:training_progress (
            progress_percentage,
            time_spent_minutes,
            quiz_score,
            completed,
            completed_at
          )
        `)
        .eq('user_id', user_id)
        .order('enrolled_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ enrollments: data });
    }

    // List training modules
    let query = supabase
      .from('training_modules')
      .select(`
        *,
        enrollments:training_enrollments(count)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ modules: data });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'training:list', resource: 'training' }
  }
);

// POST - Create module, enroll user, or update progress
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { action } = body;

    if (action === 'enroll') {
      const validated = enrollmentSchema.parse(body.data);

      // Check prerequisites
      const { data: module } = await supabase
        .from('training_modules')
        .select('prerequisites')
        .eq('id', validated.module_id)
        .single();

      if (module?.prerequisites && module.prerequisites.length > 0) {
        const { data: completed } = await supabase
          .from('training_enrollments')
          .select('module_id')
          .eq('user_id', validated.user_id)
          .eq('status', 'completed')
          .in('module_id', module.prerequisites);

        if (!completed || completed.length < module.prerequisites.length) {
          return NextResponse.json({
            error: 'Prerequisites not completed',
            missing: module.prerequisites.filter(
              (p: string) => !completed?.some(c => c.module_id === p)
            )
          }, { status: 400 });
        }
      }

      // Create enrollment
      const { data: enrollment, error } = await supabase
        .from('training_enrollments')
        .insert({
          ...validated,
          enrolled_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        enrollment,
        message: 'User enrolled successfully'
      }, { status: 201 });
    }

    if (action === 'update_progress') {
      const validated = progressSchema.parse(body.data);

      // Update or create progress record
      const { data: existing } = await supabase
        .from('training_progress')
        .select('id')
        .eq('enrollment_id', validated.enrollment_id)
        .single();

      let progressData;
      if (existing) {
        const { data, error } = await supabase
          .from('training_progress')
          .update({
            progress_percentage: validated.progress_percentage,
            time_spent_minutes: validated.time_spent_minutes,
            quiz_score: validated.quiz_score,
            completed: validated.completed,
            completed_at: validated.completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        progressData = data;
      } else {
        const { data, error } = await supabase
          .from('training_progress')
          .insert({
            ...validated,
            completed_at: validated.completed ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        progressData = data;
      }

      // Update enrollment status if completed
      if (validated.completed) {
        const { data: enrollment } = await supabase
          .from('training_enrollments')
          .select('*, training_modules(*)')
          .eq('id', validated.enrollment_id)
          .single();

        const passed = !enrollment?.training_modules?.passing_score ||
          (validated.quiz_score && validated.quiz_score >= enrollment.training_modules.passing_score);

        await supabase
          .from('training_enrollments')
          .update({
            status: passed ? 'completed' : 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', validated.enrollment_id);

        // Issue certification if required and passed
        if (passed && enrollment?.training_modules?.certification_required) {
          await supabase.from('certifications').insert({
            user_id: enrollment.user_id,
            training_module_id: enrollment.module_id,
            issued_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
          });
        }
      }

      return NextResponse.json({
        progress: progressData,
        message: 'Progress updated successfully'
      });
    }

    // Create training module
    const validated = trainingModuleSchema.parse(body.data || body);

    const { data: module, error } = await supabase
      .from('training_modules')
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
      module,
      message: 'Training module created successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    audit: { action: 'training:create', resource: 'training' }
  }
);

// PUT - Update module or enrollment
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, type, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const table = type === 'enrollment' ? 'training_enrollments' : 'training_modules';

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
      message: `${type === 'enrollment' ? 'Enrollment' : 'Module'} updated successfully`
    });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'training:update', resource: 'training' }
  }
);

// DELETE - Deactivate module or cancel enrollment
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
        .from('training_enrollments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Enrollment cancelled' });
    }

    // Deactivate module
    const { error } = await supabase
      .from('training_modules')
      .update({ active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Module deactivated' });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'training:delete', resource: 'training' }
  }
);
