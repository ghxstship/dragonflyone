import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const reviewSchema = z.object({
  employee_id: z.string().uuid(),
  reviewer_id: z.string().uuid(),
  review_period: z.string(),
  review_type: z.enum(['annual', 'quarterly', 'probation', 'project', 'self']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
  overall_score: z.number().min(1).max(5).optional(),
  strengths: z.array(z.string()).optional(),
  improvements: z.array(z.string()).optional(),
  goals_achieved: z.number().min(0).max(100).optional(),
  comments: z.string().optional(),
  scheduled_date: z.string().optional(),
});

const goalSchema = z.object({
  employee_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  target_date: z.string(),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(['not_started', 'in_progress', 'on_track', 'at_risk', 'completed', 'cancelled']).default('not_started'),
  category: z.enum(['performance', 'development', 'project', 'certification', 'other']).optional(),
  metrics: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employee_id');
    const reviewerId = searchParams.get('reviewer_id');
    const includeGoals = searchParams.get('include_goals') === 'true';

    // Fetch reviews
    let reviewQuery = supabase
      .from('performance_reviews')
      .select(`
        *,
        employee:platform_users!performance_reviews_employee_id_fkey(id, full_name, email),
        reviewer:platform_users!performance_reviews_reviewer_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      reviewQuery = reviewQuery.eq('status', status);
    }
    if (employeeId) {
      reviewQuery = reviewQuery.eq('employee_id', employeeId);
    }
    if (reviewerId) {
      reviewQuery = reviewQuery.eq('reviewer_id', reviewerId);
    }

    const { data: reviews, error: reviewError } = await reviewQuery;

    if (reviewError) {
      console.error('Error fetching reviews:', reviewError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews', details: reviewError.message },
        { status: 500 }
      );
    }

    // Fetch goals if requested
    let goals: any[] = [];
    if (includeGoals) {
      let goalQuery = supabase
        .from('performance_goals')
        .select(`
          *,
          employee:platform_users!performance_goals_employee_id_fkey(id, full_name, email)
        `)
        .order('target_date', { ascending: true });

      if (employeeId) {
        goalQuery = goalQuery.eq('employee_id', employeeId);
      }

      const { data: goalData, error: goalError } = await goalQuery;
      if (!goalError && goalData) {
        goals = goalData;
      }
    }

    // Calculate summary statistics
    const completedReviews = reviews?.filter(r => r.status === 'completed') || [];
    const avgScore = completedReviews.length > 0
      ? completedReviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / completedReviews.length
      : 0;

    const summary = {
      total_reviews: reviews?.length || 0,
      by_status: {
        scheduled: reviews?.filter(r => r.status === 'scheduled').length || 0,
        in_progress: reviews?.filter(r => r.status === 'in_progress').length || 0,
        completed: completedReviews.length,
        cancelled: reviews?.filter(r => r.status === 'cancelled').length || 0,
      },
      average_score: avgScore.toFixed(1),
      goals_on_track: goals.filter(g => g.status === 'on_track' || g.status === 'completed').length,
      goals_at_risk: goals.filter(g => g.status === 'at_risk').length,
    };

    return NextResponse.json({
      reviews: reviews || [],
      goals,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/performance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'goal') {
      const validated = goalSchema.parse(body.data);
      const { data: goal, error } = await supabase
        .from('performance_goals')
        .insert([validated])
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create goal', details: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(goal, { status: 201 });
    } else {
      const validated = reviewSchema.parse(body.data || body);
      const { data: review, error } = await supabase
        .from('performance_reviews')
        .insert([validated])
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create review', details: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json(review, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/performance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, type, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const table = type === 'goal' ? 'performance_goals' : 'performance_reviews';
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update ${type || 'review'}`, details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/performance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
