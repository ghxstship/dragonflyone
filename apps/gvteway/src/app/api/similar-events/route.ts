import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// Similar events and "Fans also bought" recommendations
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type'); // 'similar', 'fans_also_bought'

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    if (type === 'fans_also_bought') {
      // Collaborative filtering - find events bought by users who bought this event
      const { data: buyers } = await supabase.from('orders')
        .select('user_id').eq('event_id', eventId);

      const buyerIds = buyers?.map(b => b.user_id) || [];

      if (buyerIds.length > 0) {
        const { data: otherPurchases } = await supabase.from('orders')
          .select('event_id, events(*)')
          .in('user_id', buyerIds)
          .neq('event_id', eventId)
          .gte('events.date', new Date().toISOString());

        // Count frequency
        const eventCounts = new Map();
        otherPurchases?.forEach(p => {
          if (p.events) {
            const count = eventCounts.get(p.event_id) || { event: p.events, count: 0 };
            count.count++;
            eventCounts.set(p.event_id, count);
          }
        });

        const sorted = Array.from(eventCounts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map(e => ({ ...e.event, buyer_overlap: e.count }));

        return NextResponse.json({ events: sorted, type: 'fans_also_bought' });
      }
    }

    // Similar events by genre, artist, venue
    const { data: similar, error } = await supabase.from('events').select('*')
      .neq('id', eventId)
      .gte('date', new Date().toISOString())
      .eq('status', 'published')
      .or(`genre.eq.${event.genre},venue.eq.${event.venue}`)
      .limit(10);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Score by similarity
    const scored = similar?.map(e => ({
      ...e,
      similarity_score: 
        (e.genre === event.genre ? 40 : 0) +
        (e.venue === event.venue ? 30 : 0) +
        (e.artist_ids?.some((a: string) => event.artist_ids?.includes(a)) ? 30 : 0)
    })).sort((a, b) => b.similarity_score - a.similarity_score);

    return NextResponse.json({ events: scored, type: 'similar' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
