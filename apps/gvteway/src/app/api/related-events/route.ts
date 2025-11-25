import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Related event linking
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    const { data, error } = await supabase.from('related_events').select(`
      *, related:events!related_event_id(id, title, date, venue, image_url)
    `).eq('event_id', eventId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ related_events: data?.map(r => ({ ...r.related, relationship: r.relationship })) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'link') {
      const { event_id, related_event_id, relationship } = body;

      const { data, error } = await supabase.from('related_events').insert({
        event_id, related_event_id, relationship: relationship || 'similar'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Create bidirectional link
      await supabase.from('related_events').insert({
        event_id: related_event_id, related_event_id: event_id, relationship: relationship || 'similar'
      });

      return NextResponse.json({ link: data }, { status: 201 });
    }

    if (action === 'unlink') {
      const { event_id, related_event_id } = body;

      await supabase.from('related_events').delete()
        .or(`and(event_id.eq.${event_id},related_event_id.eq.${related_event_id}),and(event_id.eq.${related_event_id},related_event_id.eq.${event_id})`);

      return NextResponse.json({ success: true });
    }

    if (action === 'auto_suggest') {
      const { event_id } = body;

      // Get event details
      const { data: event } = await supabase.from('events').select('genre, venue_id, artist_ids').eq('id', event_id).single();

      // Find similar events
      let query = supabase.from('events').select('id, title, date, venue, image_url')
        .neq('id', event_id).limit(10);

      if (event?.genre) query = query.eq('genre', event.genre);

      const { data: suggestions } = await query;

      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
