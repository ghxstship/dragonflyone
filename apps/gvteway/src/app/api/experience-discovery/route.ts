import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/experience-discovery - Discover events and experiences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const authHeader = request.headers.get('authorization');

    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    if (action === 'curated_collections') {
      const { data: collections } = await supabase
        .from('experience_collections')
        .select(`
          id, name, description, image_url, slug,
          events:experience_collection_items(
            event:events(id, name, event_date, venue_name, image_url, min_price)
          )
        `)
        .eq('is_active', true)
        .order('sort_order')
        .limit(10);

      return NextResponse.json({ collections: collections || [] });
    }

    if (action === 'trending') {
      const { data: trending } = await supabase
        .from('events')
        .select('id, name, event_date, venue_name, venue_city, image_url, min_price, tickets_sold')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .order('tickets_sold', { ascending: false })
        .limit(12);

      return NextResponse.json({ trending: trending || [] });
    }

    if (action === 'this_weekend') {
      const now = new Date();
      const friday = new Date(now);
      friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
      friday.setHours(0, 0, 0, 0);

      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      sunday.setHours(23, 59, 59, 999);

      const { data: weekend } = await supabase
        .from('events')
        .select('id, name, event_date, venue_name, venue_city, image_url, min_price')
        .eq('status', 'published')
        .gte('event_date', friday.toISOString())
        .lte('event_date', sunday.toISOString())
        .order('event_date');

      return NextResponse.json({ weekend: weekend || [] });
    }

    if (action === 'nearby') {
      const lat = parseFloat(searchParams.get('lat') || '0');
      const lng = parseFloat(searchParams.get('lng') || '0');
      const radius = parseInt(searchParams.get('radius') || '50');

      if (!lat || !lng) {
        return NextResponse.json({ error: 'Location required' }, { status: 400 });
      }

      // Simple bounding box query
      const latDelta = radius / 69;
      const lngDelta = radius / (69 * Math.cos(lat * Math.PI / 180));

      const { data: nearby } = await supabase
        .from('events')
        .select('id, name, event_date, venue_name, venue_city, image_url, min_price, venue_lat, venue_lng')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .gte('venue_lat', lat - latDelta)
        .lte('venue_lat', lat + latDelta)
        .gte('venue_lng', lng - lngDelta)
        .lte('venue_lng', lng + lngDelta)
        .limit(20);

      return NextResponse.json({ nearby: nearby || [] });
    }

    if (action === 'for_you' && userId) {
      // Get user preferences
      const { data: profile } = await supabase
        .from('fan_profiles')
        .select('favorite_genres, favorite_artists, preferred_venues')
        .eq('user_id', userId)
        .single();

      // Get past attendance
      const { data: attendance } = await supabase
        .from('event_attendance')
        .select('event:events(genres, category_id)')
        .eq('user_id', userId)
        .limit(20);

      // Build preference profile
      const genres = new Set<string>(profile?.favorite_genres || []);
      attendance?.forEach(a => {
        if (Array.isArray((a.event as any)?.genres)) {
          (a.event as any).genres.forEach((g: string) => genres.add(g));
        }
      });

      // Find matching events
      let query = supabase
        .from('events')
        .select('id, name, event_date, venue_name, venue_city, image_url, min_price, genres')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString());

      if (genres.size > 0) {
        query = query.overlaps('genres', Array.from(genres));
      }

      const { data: recommended } = await query.limit(12);

      return NextResponse.json({
        for_you: recommended || [],
        based_on: {
          genres: Array.from(genres),
          past_events: attendance?.length || 0,
        },
      });
    }

    if (action === 'by_genre') {
      const genre = searchParams.get('genre');
      if (!genre) {
        // Return available genres
        const { data: events } = await supabase
          .from('events')
          .select('genres')
          .eq('status', 'published')
          .gte('event_date', new Date().toISOString());

        const allGenres = new Set<string>();
        events?.forEach(e => {
          if (Array.isArray(e.genres)) {
            e.genres.forEach((g: string) => allGenres.add(g));
          }
        });

        return NextResponse.json({ genres: Array.from(allGenres).sort() });
      }

      const { data: events } = await supabase
        .from('events')
        .select('id, name, event_date, venue_name, venue_city, image_url, min_price')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .contains('genres', [genre])
        .order('event_date')
        .limit(20);

      return NextResponse.json({ events: events || [] });
    }

    if (action === 'by_artist') {
      const artistId = searchParams.get('artist_id');
      if (!artistId) {
        return NextResponse.json({ error: 'Artist ID required' }, { status: 400 });
      }

      const { data: artist } = await supabase
        .from('artists')
        .select('id, name, image_url, bio, genres')
        .eq('id', artistId)
        .single();

      const { data: events } = await supabase
        .from('event_artists')
        .select(`
          event:events(id, name, event_date, venue_name, venue_city, image_url, min_price)
        `)
        .eq('artist_id', artistId)
        .gte('event.event_date', new Date().toISOString())
        .order('event.event_date');

      return NextResponse.json({
        artist,
        upcoming_events: events?.map(e => e.event) || [],
      });
    }

    if (action === 'by_venue') {
      const venueId = searchParams.get('venue_id');
      if (!venueId) {
        return NextResponse.json({ error: 'Venue ID required' }, { status: 400 });
      }

      const { data: venue } = await supabase
        .from('venues')
        .select('id, name, city, state, image_url, capacity')
        .eq('id', venueId)
        .single();

      const { data: events } = await supabase
        .from('events')
        .select('id, name, event_date, image_url, min_price')
        .eq('venue_id', venueId)
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .order('event_date')
        .limit(20);

      return NextResponse.json({
        venue,
        upcoming_events: events || [],
      });
    }

    // Default: Homepage discovery
    const { data: featured } = await supabase
      .from('events')
      .select('id, name, event_date, venue_name, venue_city, image_url, min_price')
      .eq('status', 'published')
      .eq('is_featured', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date')
      .limit(6);

    const { data: upcoming } = await supabase
      .from('events')
      .select('id, name, event_date, venue_name, venue_city, image_url, min_price')
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString())
      .order('event_date')
      .limit(12);

    return NextResponse.json({
      featured: featured || [],
      upcoming: upcoming || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

// POST /api/experience-discovery - Save preferences or create collection
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
    const action = body.action || 'save_preference';

    if (action === 'save_preference') {
      const { preference_type, value } = body;

      await supabase
        .from('fan_profiles')
        .upsert({
          user_id: user.id,
          [preference_type]: value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      return NextResponse.json({ success: true });
    } else if (action === 'create_collection') {
      const { name, description, event_ids } = body;

      const { data: collection, error } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          name,
          description,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (event_ids?.length) {
        const items = event_ids.map((eventId: string, index: number) => ({
          collection_id: collection.id,
          event_id: eventId,
          sort_order: index,
        }));

        await supabase.from('user_collection_items').insert(items);
      }

      return NextResponse.json({ collection }, { status: 201 });
    } else if (action === 'share_event') {
      const { event_id, platform } = body;

      // Log share for analytics
      await supabase.from('event_shares').insert({
        event_id,
        user_id: user.id,
        platform,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
