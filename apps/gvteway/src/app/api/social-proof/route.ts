import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const widgetType = searchParams.get('type');

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    if (widgetType === 'attendee_count') {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'sold');

      return NextResponse.json({
        widget_type: 'attendee_count',
        data: { count: count || 0, label: 'people attending' },
      });
    }

    if (widgetType === 'trending') {
      const { data: event } = await supabase
        .from('events')
        .select('id, name, view_count')
        .eq('id', eventId)
        .single();

      const { count: recentPurchases } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      return NextResponse.json({
        widget_type: 'trending',
        data: {
          views: event?.view_count || 0,
          recent_purchases: recentPurchases || 0,
          is_trending: (recentPurchases || 0) > 10,
        },
      });
    }

    if (widgetType === 'recent_purchases') {
      const { data: purchases } = await supabase
        .from('tickets')
        .select('created_at, ticket_type')
        .eq('event_id', eventId)
        .eq('status', 'sold')
        .order('created_at', { ascending: false })
        .limit(10);

      const anonymized = purchases?.map(p => ({
        time_ago: getTimeAgo(new Date(p.created_at)),
        ticket_type: p.ticket_type,
      }));

      return NextResponse.json({
        widget_type: 'recent_purchases',
        data: { purchases: anonymized },
      });
    }

    if (widgetType === 'reviews') {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating, content, created_at, user:platform_users(first_name)')
        .eq('event_id', eventId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5);

      const avgRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      return NextResponse.json({
        widget_type: 'reviews',
        data: {
          average_rating: Math.round(avgRating * 10) / 10,
          review_count: reviews?.length || 0,
          recent_reviews: reviews,
        },
      });
    }

    // Get all widgets for event
    const { data: widgets } = await supabase
      .from('social_proof_widgets')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'active');

    return NextResponse.json({ widgets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { event_id, widget_type, settings } = body;

    const { data: widget, error } = await supabase
      .from('social_proof_widgets')
      .insert({
        event_id,
        widget_type,
        settings,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ widget }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: widget, error } = await supabase
      .from('social_proof_widgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ widget });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
