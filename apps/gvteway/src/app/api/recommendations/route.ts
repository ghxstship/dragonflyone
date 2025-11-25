import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch personalized recommendations
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'for_you', 'similar', 'because_you_liked', 'friends_attending'
    const eventId = searchParams.get('event_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    let userId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    if (type === 'similar' && eventId) {
      return await getSimilarEvents(eventId, limit);
    }

    if (type === 'because_you_liked' && userId && eventId) {
      return await getBecauseYouLiked(userId, eventId, limit);
    }

    if (type === 'friends_attending' && userId) {
      return await getFriendsAttending(userId, limit);
    }

    // Default: personalized recommendations
    if (userId) {
      return await getPersonalizedRecommendations(userId, limit);
    }

    // Fallback: trending events
    return await getTrendingEvents(limit);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

async function getPersonalizedRecommendations(userId: string, limit: number) {
  // Fetch user's preferences and history
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: history } = await supabase
    .from('orders')
    .select('event_id, events(genre, venue, artist_ids)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  // Extract preferred genres and artists
  const genres = new Set<string>();
  const artists = new Set<string>();

  history?.forEach((h: any) => {
    if (h.events?.genre) genres.add(h.events.genre);
    if (h.events?.artist_ids) {
      h.events.artist_ids.forEach((a: string) => artists.add(a));
    }
  });

  if (preferences?.favorite_genres) {
    preferences.favorite_genres.forEach((g: string) => genres.add(g));
  }

  // Fetch recommended events
  let query = supabase
    .from('events')
    .select('*')
    .gte('date', new Date().toISOString())
    .eq('status', 'published')
    .order('date', { ascending: true })
    .limit(limit);

  if (genres.size > 0) {
    query = query.in('genre', Array.from(genres));
  }

  const { data: events, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Score and sort events
  const scoredEvents = events.map(event => {
    let score = 0;
    if (genres.has(event.genre)) score += 10;
    if (event.artist_ids?.some((a: string) => artists.has(a))) score += 20;
    return { ...event, recommendation_score: score };
  });

  scoredEvents.sort((a, b) => b.recommendation_score - a.recommendation_score);

  return NextResponse.json({
    recommendations: scoredEvents,
    type: 'personalized',
    based_on: {
      genres: Array.from(genres),
      artists_count: artists.size,
      history_count: history?.length || 0,
    },
  });
}

async function getSimilarEvents(eventId: string, limit: number) {
  // Fetch the source event
  const { data: sourceEvent } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!sourceEvent) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Find similar events by genre and venue type
  const { data: similar, error } = await supabase
    .from('events')
    .select('*')
    .neq('id', eventId)
    .eq('genre', sourceEvent.genre)
    .gte('date', new Date().toISOString())
    .eq('status', 'published')
    .order('date', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    recommendations: similar,
    type: 'similar',
    source_event: { id: sourceEvent.id, name: sourceEvent.name },
  });
}

async function getBecauseYouLiked(userId: string, eventId: string, limit: number) {
  // Fetch the liked event
  const { data: likedEvent } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!likedEvent) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Find events with same artists or genre
  let query = supabase
    .from('events')
    .select('*')
    .neq('id', eventId)
    .gte('date', new Date().toISOString())
    .eq('status', 'published');

  if (likedEvent.artist_ids?.length > 0) {
    query = query.overlaps('artist_ids', likedEvent.artist_ids);
  } else {
    query = query.eq('genre', likedEvent.genre);
  }

  const { data: events, error } = await query.limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    recommendations: events,
    type: 'because_you_liked',
    source_event: { id: likedEvent.id, name: likedEvent.name },
  });
}

async function getFriendsAttending(userId: string, limit: number) {
  // Fetch user's friends/follows
  const { data: follows } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (!follows || follows.length === 0) {
    return NextResponse.json({
      recommendations: [],
      type: 'friends_attending',
      message: 'Follow friends to see what events they are attending',
    });
  }

  const friendIds = follows.map(f => f.following_id);

  // Find events friends are attending
  const { data: friendOrders } = await supabase
    .from('orders')
    .select(`
      event_id,
      user_id,
      events(*)
    `)
    .in('user_id', friendIds)
    .gte('events.date', new Date().toISOString());

  // Group by event and count friends
  const eventMap = new Map<string, { event: any; friends: string[] }>();

  friendOrders?.forEach((order: any) => {
    if (order.events) {
      const existing = eventMap.get(order.event_id);
      if (existing) {
        existing.friends.push(order.user_id);
      } else {
        eventMap.set(order.event_id, {
          event: order.events,
          friends: [order.user_id],
        });
      }
    }
  });

  const recommendations = Array.from(eventMap.values())
    .sort((a, b) => b.friends.length - a.friends.length)
    .slice(0, limit)
    .map(({ event, friends }) => ({
      ...event,
      friends_attending: friends.length,
    }));

  return NextResponse.json({
    recommendations,
    type: 'friends_attending',
  });
}

async function getTrendingEvents(limit: number) {
  // Fetch trending based on recent sales and views
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', new Date().toISOString())
    .eq('status', 'published')
    .order('tickets_sold', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    recommendations: events,
    type: 'trending',
  });
}
