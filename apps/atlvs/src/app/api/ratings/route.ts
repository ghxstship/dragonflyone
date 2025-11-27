import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const RatingSchema = z.object({
  entity_type: z.enum(['vendor', 'crew', 'client', 'venue']),
  entity_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  overall_rating: z.number().min(1).max(5),
  categories: z.array(z.object({
    name: z.string(),
    rating: z.number().min(1).max(5),
  })).optional(),
  review: z.string().optional(),
  would_recommend: z.boolean().optional(),
  is_public: z.boolean().default(false),
});

// GET /api/ratings - Get ratings for vendors/crew
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const action = searchParams.get('action');

    if (action === 'leaderboard') {
      const type = searchParams.get('type') || 'vendor';

      const { data: leaderboard } = await supabase
        .from('rating_summaries')
        .select(`
          entity_id,
          entity_type,
          average_rating,
          total_ratings,
          recommendation_rate
        `)
        .eq('entity_type', type)
        .order('average_rating', { ascending: false })
        .limit(20);

      // Get entity details
      const enrichedLeaderboard = await Promise.all(
        (leaderboard || []).map(async (item) => {
          let entityDetails = null;

          if (item.entity_type === 'vendor') {
            const { data } = await supabase
              .from('vendors')
              .select('name, logo_url')
              .eq('id', item.entity_id)
              .single();
            entityDetails = data;
          } else if (item.entity_type === 'crew') {
            const { data } = await supabase
              .from('platform_users')
              .select('first_name, last_name, avatar_url')
              .eq('id', item.entity_id)
              .single();
            entityDetails = data;
          }

          return {
            ...item,
            entity: entityDetails,
          };
        })
      );

      return NextResponse.json({ leaderboard: enrichedLeaderboard });
    }

    if (action === 'summary' && entityId && entityType) {
      const { data: summary } = await supabase
        .from('rating_summaries')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .single();

      // Get rating distribution
      const { data: ratings } = await supabase
        .from('ratings')
        .select('overall_rating')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType);

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings?.forEach(r => {
        const rating = Math.round(r.overall_rating);
        if (rating >= 1 && rating <= 5) {
          distribution[rating as keyof typeof distribution]++;
        }
      });

      return NextResponse.json({
        summary: summary || {
          average_rating: 0,
          total_ratings: 0,
          recommendation_rate: 0,
        },
        distribution,
      });
    }

    if (entityId && entityType) {
      // Get ratings for specific entity
      const { data: ratings } = await supabase
        .from('ratings')
        .select(`
          *,
          reviewer:platform_users!reviewer_id(first_name, last_name, avatar_url),
          project:projects(name)
        `)
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      return NextResponse.json({ ratings: ratings || [] });
    }

    return NextResponse.json({ error: 'entity_type and entity_id required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

// POST /api/ratings - Submit rating
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const action = body.action || 'submit';

    if (action === 'submit') {
      const validated = RatingSchema.parse(body);

      // Check for existing rating
      const existingQuery = supabase
        .from('ratings')
        .select('id')
        .eq('entity_id', validated.entity_id)
        .eq('entity_type', validated.entity_type)
        .eq('reviewer_id', user.id);

      if (validated.project_id) {
        existingQuery.eq('project_id', validated.project_id);
      }

      const { data: existing } = await existingQuery.single();

      if (existing) {
        return NextResponse.json({ error: 'Already rated this entity' }, { status: 400 });
      }

      const { data: rating, error } = await supabase
        .from('ratings')
        .insert({
          ...validated,
          reviewer_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update summary
      await updateRatingSummary(validated.entity_id, validated.entity_type);

      return NextResponse.json({ rating }, { status: 201 });
    } else if (action === 'respond') {
      const { rating_id, response } = body;

      // Verify ownership
      const { data: rating } = await supabase
        .from('ratings')
        .select('entity_id, entity_type')
        .eq('id', rating_id)
        .single();

      if (!rating) {
        return NextResponse.json({ error: 'Rating not found' }, { status: 404 });
      }

      // Update with response
      const { error } = await supabase
        .from('ratings')
        .update({
          response,
          response_at: new Date().toISOString(),
          response_by: user.id,
        })
        .eq('id', rating_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'flag') {
      const { rating_id, reason } = body;

      const { error } = await supabase
        .from('rating_flags')
        .insert({
          rating_id,
          flagged_by: user.id,
          reason,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'helpful') {
      const { rating_id, is_helpful } = body;

      await supabase
        .from('rating_helpful')
        .upsert({
          rating_id,
          user_id: user.id,
          is_helpful,
        }, { onConflict: 'rating_id,user_id' });

      // Update helpful count
      const { data: helpfulCounts } = await supabase
        .from('rating_helpful')
        .select('is_helpful')
        .eq('rating_id', rating_id);

      const helpfulCount = helpfulCounts?.filter(h => h.is_helpful).length || 0;

      await supabase
        .from('ratings')
        .update({ helpful_count: helpfulCount })
        .eq('id', rating_id);

      return NextResponse.json({ success: true, helpful_count: helpfulCount });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to update rating summary
async function updateRatingSummary(entityId: string, entityType: string) {
  const { data: ratings } = await supabase
    .from('ratings')
    .select('overall_rating, would_recommend')
    .eq('entity_id', entityId)
    .eq('entity_type', entityType);

  if (!ratings || ratings.length === 0) return;

  const avgRating = ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length;
  const recommendCount = ratings.filter(r => r.would_recommend).length;
  const recommendRate = (recommendCount / ratings.length) * 100;

  await supabase
    .from('rating_summaries')
    .upsert({
      entity_id: entityId,
      entity_type: entityType,
      average_rating: avgRating,
      total_ratings: ratings.length,
      recommendation_rate: recommendRate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'entity_id,entity_type' });
}
