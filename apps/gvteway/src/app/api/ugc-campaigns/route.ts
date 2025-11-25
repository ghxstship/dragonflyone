import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// User-generated content campaigns
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const campaignId = searchParams.get('campaign_id');

    if (campaignId) {
      const { data } = await supabase.from('ugc_campaigns').select(`
        *, submissions:ugc_submissions(id, user_id, content_url, status, featured)
      `).eq('id', campaignId).single();

      return NextResponse.json({ campaign: data });
    }

    let query = supabase.from('ugc_campaigns').select(`
      *, submission_count:ugc_submissions(count)
    `);

    if (eventId) query = query.eq('event_id', eventId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ campaigns: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { event_id, title, description, hashtag, content_types, start_date, end_date, prizes } = body;

      const { data, error } = await supabase.from('ugc_campaigns').insert({
        event_id, title, description, hashtag, content_types: content_types || [],
        start_date, end_date, prizes: prizes || [], status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ campaign: data }, { status: 201 });
    }

    if (action === 'submit') {
      const { campaign_id, content_url, content_type, caption } = body;

      const { data, error } = await supabase.from('ugc_submissions').insert({
        campaign_id, user_id: user.id, content_url, content_type, caption, status: 'pending'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ submission: data }, { status: 201 });
    }

    if (action === 'moderate') {
      const { submission_id, status, featured } = body;

      await supabase.from('ugc_submissions').update({ status, featured }).eq('id', submission_id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
