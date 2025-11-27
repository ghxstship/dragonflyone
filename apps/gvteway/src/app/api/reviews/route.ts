import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

// Validation schema
const reviewSchema = z.object({
  review_type: z.enum(['event', 'venue', 'artist', 'experience', 'merchandise']),
  target_id: z.string().uuid(),
  order_id: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(10, 'Review must be at least 10 characters'),
  venue_rating: z.number().min(1).max(5).optional(),
  production_rating: z.number().min(1).max(5).optional(),
  value_rating: z.number().min(1).max(5).optional(),
  photos: z.array(z.string().url()).optional(),
  event_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/reviews - List reviews
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const reviewType = searchParams.get('review_type');
    const targetId = searchParams.get('target_id');
    const status = searchParams.get('status') || 'approved';
    const userId = searchParams.get('user_id');
    const featured = searchParams.get('featured') === 'true';
    const verified = searchParams.get('verified') === 'true';

    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:platform_users!user_id(id, full_name, avatar_url),
        responses:review_responses(
          id,
          content,
          responder_type,
          created_at,
          user:platform_users!user_id(id, full_name)
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (reviewType) {
      query = query.eq('review_type', reviewType);
    }

    if (targetId) {
      query = query.eq('target_id', targetId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (verified) {
      query = query.eq('verified_purchase', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews', details: error.message },
        { status: 500 }
      );
    }

    // If targetId is provided, also fetch statistics
    let statistics = null;
    if (targetId && reviewType) {
      const { data: stats } = await supabase
        .from('review_statistics')
        .select('*')
        .eq('target_type', reviewType)
        .eq('target_id', targetId)
        .single();

      statistics = stats;
    }

    return NextResponse.json({
      reviews: data,
      statistics,
      count: data.length,
    });
  } catch (error) {
    console.error('Error in GET /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();

    // Validate input
    const validated = reviewSchema.parse(body);

    // TODO: Get user from auth session
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Check if user has already reviewed this target
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('review_type', validated.review_type)
      .eq('target_id', validated.target_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this item' },
        { status: 400 }
      );
    }

    // Verify purchase if order_id is provided
    let verifiedPurchase = false;
    let verifiedAttendee = false;
    if (validated.order_id) {
      const { data: order } = await supabase
        .from('orders')
        .select('id, user_id, status')
        .eq('id', validated.order_id)
        .eq('user_id', userId)
        .single();

      if (order && order.status === 'completed') {
        verifiedPurchase = true;
        verifiedAttendee = true;
      }
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          ...validated,
          user_id: userId,
          verified_purchase: verifiedPurchase,
          verified_attendee: verifiedAttendee,
          status: 'pending', // Requires moderation
        },
      ])
      .select(`
        *,
        user:platform_users!user_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to create review', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews - Moderate reviews (admin/moderator only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { review_ids, action, notes } = body;

    if (!review_ids || !Array.isArray(review_ids) || review_ids.length === 0) {
      return NextResponse.json(
        { error: 'review_ids array is required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'flag', 'hide'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // TODO: Verify user is admin/moderator

    const statusMap: Record<string, string> = {
      approve: 'approved',
      reject: 'rejected',
      flag: 'flagged',
      hide: 'hidden',
    };

    // TODO: Get user from auth session
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('reviews')
      .update({
        status: statusMap[action],
        moderation_notes: notes,
        moderated_at: new Date().toISOString(),
        moderated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .in('id', review_ids)
      .select();

    if (error) {
      console.error('Error moderating reviews:', error);
      return NextResponse.json(
        { error: 'Failed to moderate reviews', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      moderated: data.length,
      reviews: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
