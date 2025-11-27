import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const ratingSchema = z.object({
  entity_type: z.enum(['vendor', 'crew_member', 'experience', 'event', 'venue', 'service']),
  entity_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  overall_rating: z.number().min(1).max(5),
  category_ratings: z.record(z.number().min(1).max(5)).optional(),
  title: z.string().max(255).optional(),
  review_text: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  photo_urls: z.array(z.string().url()).optional(),
  is_anonymous: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const entity_type = searchParams.get('entity_type');
    const entity_id = searchParams.get('entity_id');
    const min_rating = searchParams.get('min_rating');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!entity_type || !entity_id) {
      return NextResponse.json(
        { error: 'entity_type and entity_id are required' },
        { status: 400 }
      );
    }

    // Get rating aggregate
    const { data: aggregate } = await supabase
      .from('rating_aggregates')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .single();

    // Get individual ratings
    let query = supabase
      .from('ratings')
      .select(`
        *,
        rater:platform_users!rater_id(id, full_name, avatar_url),
        project:projects(id, name),
        event:events(id, name)
      `, { count: 'exact' })
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .eq('status', 'approved');

    if (min_rating) {
      query = query.gte('overall_rating', parseFloat(min_rating));
    }

    const { data: ratings, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Mask rater info for anonymous ratings
    const processedRatings = ratings?.map(rating => {
      if (rating.is_anonymous) {
        return {
          ...rating,
          rater: null,
          rater_id: null,
        };
      }
      return rating;
    });

    return NextResponse.json({
      aggregate,
      ratings: processedRatings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = ratingSchema.parse(body);

    // Check if user already rated this entity
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('entity_type', validated.entity_type)
      .eq('entity_id', validated.entity_id)
      .eq('rater_id', platformUser.id)
      .single();

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this entity' },
        { status: 409 }
      );
    }

    // Determine rater type based on roles
    let raterType = 'client';
    if (platformUser.platform_roles?.includes('COMPVSS_CREW_MEMBER')) {
      raterType = 'crew';
    } else if (platformUser.platform_roles?.includes('GVTEWAY_GUEST')) {
      raterType = 'guest';
    }

    const { data, error } = await supabase
      .from('ratings')
      .insert({
        ...validated,
        rater_id: platformUser.id,
        rater_type: raterType,
        category_ratings: validated.category_ratings || {},
        pros: validated.pros || [],
        cons: validated.cons || [],
        photo_urls: validated.photo_urls || [],
        status: 'pending', // Requires moderation
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create rating error:', error);
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    );
  }
}
