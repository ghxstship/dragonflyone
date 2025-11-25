import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const trainingProgramSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(['safety', 'management', 'compliance', 'technical', 'soft_skills', 'certification']),
  duration_hours: z.number().positive(),
  instructor_name: z.string().optional(),
  instructor_id: z.string().uuid().optional(),
  capacity: z.number().positive(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  is_virtual: z.boolean().default(false),
  prerequisites: z.array(z.string()).optional(),
  learning_objectives: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  certification_awarded: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const includeEnrollments = searchParams.get('include_enrollments') === 'true';

    let query = supabase
      .from('training_programs')
      .select('*')
      .order('start_date', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: programs, error } = await query;

    if (error) {
      console.error('Error fetching training programs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch training programs', details: error.message },
        { status: 500 }
      );
    }

    // Get recent completions
    const { data: recentCompletions } = await supabase
      .from('training_completions')
      .select(`
        *,
        employee:platform_users!training_completions_user_id_fkey(id, full_name, email),
        program:training_programs!training_completions_program_id_fkey(id, title)
      `)
      .order('completed_at', { ascending: false })
      .limit(10);

    // Calculate summary statistics
    const programList = programs as any[] || [];
    const activePrograms = programList.filter(p => p.status === 'active');
    const totalEnrolled = programList.reduce((sum, p) => sum + (p.enrolled_count || 0), 0);

    const summary = {
      total_programs: programList.length,
      active_programs: activePrograms.length,
      total_enrolled: totalEnrolled,
      by_category: {
        safety: programList.filter(p => p.category === 'safety').length,
        management: programList.filter(p => p.category === 'management').length,
        compliance: programList.filter(p => p.category === 'compliance').length,
        technical: programList.filter(p => p.category === 'technical').length,
        soft_skills: programList.filter(p => p.category === 'soft_skills').length,
        certification: programList.filter(p => p.category === 'certification').length,
      },
    };

    return NextResponse.json({
      programs: programs || [],
      recent_completions: recentCompletions || [],
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/training:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = trainingProgramSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: program, error } = await supabase
      .from('training_programs')
      .insert([
        {
          ...validated,
          organization_id: organizationId,
          created_by: userId,
          status: 'draft',
          enrolled_count: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating training program:', error);
      return NextResponse.json(
        { error: 'Failed to create training program', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/training:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
