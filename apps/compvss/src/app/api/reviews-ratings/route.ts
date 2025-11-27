import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Reviews and ratings with response capability
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    let query = supabase.from('reviews').select(`
      *, reviewer:platform_users(first_name, last_name),
      response:review_responses(id, content, responded_at)
    `);

    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate average
    const avgRating = data?.length ? data.reduce((s, r) => s + r.rating, 0) / data.length : 0;

    return NextResponse.json({
      reviews: data,
      summary: {
        count: data?.length || 0,
        average: Math.round(avgRating * 10) / 10,
        distribution: {
          5: data?.filter(r => r.rating === 5).length || 0,
          4: data?.filter(r => r.rating === 4).length || 0,
          3: data?.filter(r => r.rating === 3).length || 0,
          2: data?.filter(r => r.rating === 2).length || 0,
          1: data?.filter(r => r.rating === 1).length || 0
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'submit') {
      const { entity_type, entity_id, rating, title, content, project_id } = body;

      const { data, error } = await supabase.from('reviews').insert({
        entity_type, entity_id, rating, title, content,
        project_id, reviewer_id: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ review: data }, { status: 201 });
    }

    if (action === 'respond') {
      const { review_id, content } = body;

      const { data, error } = await supabase.from('review_responses').insert({
        review_id, content, responder_id: user.id, responded_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ response: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
