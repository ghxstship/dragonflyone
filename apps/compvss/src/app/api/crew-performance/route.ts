import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PerformanceReviewSchema = z.object({
  crew_id: z.string().uuid(),
  project_id: z.string().uuid(),
  overall_rating: z.number().min(1).max(5),
  categories: z.array(z.object({
    category: z.string(),
    rating: z.number().min(1).max(5),
    notes: z.string().optional(),
  })),
  strengths: z.array(z.string()).optional(),
  areas_for_improvement: z.array(z.string()).optional(),
  comments: z.string().optional(),
  would_rehire: z.boolean(),
});

// GET /api/crew-performance - Get performance data
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const crewId = searchParams.get('crew_id');
    const projectId = searchParams.get('project_id');
    const action = searchParams.get('action');

    if (action === 'dashboard') {
      // Get performance dashboard
      const { data: topPerformers } = await supabase
        .from('crew_performance_summary')
        .select(`
          crew_id,
          average_rating,
          total_projects,
          rehire_rate,
          crew:platform_users(first_name, last_name, avatar_url)
        `)
        .order('average_rating', { ascending: false })
        .limit(10);

      const { data: recentReviews } = await supabase
        .from('crew_performance_reviews')
        .select(`
          *,
          crew:platform_users!crew_id(first_name, last_name),
          project:compvss_projects(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: pendingReviews } = await supabase
        .from('crew_assignments')
        .select(`
          id,
          crew:platform_users!user_id(first_name, last_name),
          project:compvss_projects(id, name, end_date)
        `)
        .eq('review_status', 'pending')
        .lt('project.end_date', new Date().toISOString())
        .limit(20);

      return NextResponse.json({
        top_performers: topPerformers || [],
        recent_reviews: recentReviews || [],
        pending_reviews: pendingReviews || [],
      });
    }

    if (action === 'leaderboard') {
      const department = searchParams.get('department');
      const period = searchParams.get('period') || 'all';

      let query = supabase
        .from('crew_performance_summary')
        .select(`
          crew_id,
          average_rating,
          total_projects,
          rehire_rate,
          on_time_rate,
          crew:platform_users(first_name, last_name, avatar_url, department)
        `)
        .order('average_rating', { ascending: false });

      if (department) {
        query = query.eq('crew.department', department);
      }

      const { data: leaderboard } = await query.limit(50);

      return NextResponse.json({ leaderboard: leaderboard || [] });
    }

    if (crewId) {
      // Get individual crew performance
      const { data: summary } = await supabase
        .from('crew_performance_summary')
        .select('*')
        .eq('crew_id', crewId)
        .single();

      const { data: reviews } = await supabase
        .from('crew_performance_reviews')
        .select(`
          *,
          project:compvss_projects(name),
          reviewer:platform_users!reviewer_id(first_name, last_name)
        `)
        .eq('crew_id', crewId)
        .order('created_at', { ascending: false });

      const { data: crewInfo } = await supabase
        .from('platform_users')
        .select('first_name, last_name, email, department, avatar_url')
        .eq('id', crewId)
        .single();

      // Calculate category averages
      const categoryAverages: Record<string, { total: number; count: number }> = {};
      reviews?.forEach(review => {
        review.categories?.forEach((cat: any) => {
          if (!categoryAverages[cat.category]) {
            categoryAverages[cat.category] = { total: 0, count: 0 };
          }
          categoryAverages[cat.category].total += cat.rating;
          categoryAverages[cat.category].count++;
        });
      });

      const categoryScores = Object.entries(categoryAverages).map(([category, data]) => ({
        category,
        average: (data.total / data.count).toFixed(1),
      }));

      return NextResponse.json({
        crew: crewInfo,
        summary: summary || {
          average_rating: 0,
          total_projects: 0,
          rehire_rate: 0,
        },
        reviews: reviews || [],
        category_scores: categoryScores,
      });
    }

    if (projectId) {
      // Get performance reviews for a project
      const { data: reviews } = await supabase
        .from('crew_performance_reviews')
        .select(`
          *,
          crew:platform_users!crew_id(first_name, last_name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      // Get crew who haven't been reviewed yet
      const { data: unreviewedCrew } = await supabase
        .from('crew_assignments')
        .select(`
          user_id,
          role,
          crew:platform_users!user_id(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .eq('review_status', 'pending');

      return NextResponse.json({
        reviews: reviews || [],
        unreviewed: unreviewedCrew || [],
      });
    }

    return NextResponse.json({ error: 'crew_id or project_id required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
  }
}

// POST /api/crew-performance - Submit review or update metrics
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
    const action = body.action || 'submit_review';

    if (action === 'submit_review') {
      const validated = PerformanceReviewSchema.parse(body);

      // Check if review already exists
      const { data: existing } = await supabase
        .from('crew_performance_reviews')
        .select('id')
        .eq('crew_id', validated.crew_id)
        .eq('project_id', validated.project_id)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Review already exists for this crew member on this project' }, { status: 400 });
      }

      const { data: review, error } = await supabase
        .from('crew_performance_reviews')
        .insert({
          ...validated,
          reviewer_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update crew assignment review status
      await supabase
        .from('crew_assignments')
        .update({ review_status: 'completed' })
        .eq('user_id', validated.crew_id)
        .eq('project_id', validated.project_id);

      // Update performance summary
      await updatePerformanceSummary(validated.crew_id);

      return NextResponse.json({ review }, { status: 201 });
    } else if (action === 'add_skill_endorsement') {
      const { crew_id, skill, notes } = body;

      const { data: endorsement, error } = await supabase
        .from('crew_skill_endorsements')
        .insert({
          crew_id,
          skill,
          notes,
          endorsed_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ endorsement }, { status: 201 });
    } else if (action === 'add_badge') {
      const { crew_id, badge_type, reason, project_id } = body;

      const { data: badge, error } = await supabase
        .from('crew_badges')
        .insert({
          crew_id,
          badge_type,
          reason,
          project_id,
          awarded_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Notify crew member
      await supabase.from('unified_notifications').insert({
        user_id: crew_id,
        title: 'New Badge Earned!',
        message: `You've earned the ${badge_type} badge: ${reason}`,
        type: 'success',
        priority: 'normal',
        source_platform: 'compvss',
        source_entity_type: 'badge',
        source_entity_id: badge.id,
      });

      return NextResponse.json({ badge }, { status: 201 });
    } else if (action === 'request_feedback') {
      const { project_id, crew_ids } = body;

      // Send feedback requests
      for (const crewId of crew_ids) {
        await supabase.from('unified_notifications').insert({
          user_id: crewId,
          title: 'Performance Feedback Request',
          message: 'Please provide feedback on your recent project experience',
          type: 'action_required',
          priority: 'normal',
          source_platform: 'compvss',
          source_entity_type: 'feedback_request',
          source_entity_id: project_id,
          link: `/projects/${project_id}/feedback`,
        });
      }

      return NextResponse.json({ success: true, requests_sent: crew_ids.length });
    } else if (action === 'set_goals') {
      const { crew_id, goals, period } = body;

      const { data: goalRecord, error } = await supabase
        .from('crew_performance_goals')
        .insert({
          crew_id,
          goals,
          period,
          status: 'active',
          set_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ goals: goalRecord }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to update performance summary
async function updatePerformanceSummary(crewId: string) {
  // Get all reviews for this crew member
  const { data: reviews } = await supabase
    .from('crew_performance_reviews')
    .select('overall_rating, would_rehire')
    .eq('crew_id', crewId);

  if (!reviews || reviews.length === 0) return;

  const avgRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length;
  const rehireRate = (reviews.filter(r => r.would_rehire).length / reviews.length) * 100;

  await supabase
    .from('crew_performance_summary')
    .upsert({
      crew_id: crewId,
      average_rating: avgRating,
      total_projects: reviews.length,
      rehire_rate: rehireRate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'crew_id' });
}
