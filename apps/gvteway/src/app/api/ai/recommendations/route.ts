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

// GET /api/ai/recommendations - AI-powered event recommendation engine
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const authHeader = request.headers.get('authorization');

    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    if (action === 'personalized' && userId) {
      // Get user profile and history
      const { data: profile } = await supabase
        .from('fan_profiles')
        .select('favorite_genres, favorite_artists, preferred_venues, preferred_price_range')
        .eq('user_id', userId)
        .single();

      const { data: attendance } = await supabase
        .from('event_attendance')
        .select('event_id, event:events(genres, category_id, venue_id)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: purchases } = await supabase
        .from('orders')
        .select('total_amount, event_id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Build preference profile
      const genreWeights: Record<string, number> = {};
      const venueWeights: Record<string, number> = {};

      // From explicit preferences
      profile?.favorite_genres?.forEach((g: string) => {
        genreWeights[g] = (genreWeights[g] || 0) + 3;
      });

      // From attendance history
      attendance?.forEach(a => {
        const event = a.event as any;
        if (event?.genres) {
          event.genres.forEach((g: string) => {
            genreWeights[g] = (genreWeights[g] || 0) + 1;
          });
        }
        if (event?.venue_id) {
          venueWeights[event.venue_id] = (venueWeights[event.venue_id] || 0) + 1;
        }
      });

      // Calculate average spend
      const avgSpend = purchases?.length
        ? purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0) / purchases.length
        : 100;

      // Get upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('id, name, event_date, venue_name, venue_id, image_url, min_price, max_price, genres')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .limit(100);

      // Score and rank events
      const scoredEvents = events?.map(event => {
        let score = 0;
        const reasons: string[] = [];

        // Genre match
        if (event.genres) {
          event.genres.forEach((g: string) => {
            if (genreWeights[g]) {
              score += genreWeights[g] * 10;
              if (genreWeights[g] >= 3) reasons.push(`You love ${g}`);
            }
          });
        }

        // Venue preference
        if (venueWeights[event.venue_id]) {
          score += venueWeights[event.venue_id] * 5;
          reasons.push('Venue you\'ve enjoyed');
        }

        // Price match
        if (event.min_price && event.min_price <= avgSpend * 1.5) {
          score += 10;
        }

        return {
          ...event,
          recommendation_score: score,
          reasons: reasons.slice(0, 2),
        };
      }).sort((a, b) => b.recommendation_score - a.recommendation_score).slice(0, 20);

      return NextResponse.json({
        recommendations: scoredEvents || [],
        profile_summary: {
          top_genres: Object.entries(genreWeights)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([genre]) => genre),
          average_spend: avgSpend,
          events_attended: attendance?.length || 0,
        },
      });
    }

    if (action === 'similar') {
      const eventId = searchParams.get('event_id');
      if (!eventId) {
        return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
      }

      // Get source event
      const { data: sourceEvent } = await supabase
        .from('events')
        .select('genres, category_id, venue_id, min_price, max_price')
        .eq('id', eventId)
        .single();

      if (!sourceEvent) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Find similar events
      let query = supabase
        .from('events')
        .select('id, name, event_date, venue_name, image_url, min_price, genres')
        .eq('status', 'published')
        .neq('id', eventId)
        .gte('event_date', new Date().toISOString());

      if (sourceEvent.genres?.length) {
        query = query.overlaps('genres', sourceEvent.genres);
      }

      const { data: similar } = await query.limit(10);

      // Score similarity
      const scored = similar?.map(event => {
        let similarity = 0;

        // Genre overlap
        const sourceGenres = new Set(sourceEvent.genres || []);
        const eventGenres = event.genres || [];
        const overlap = eventGenres.filter((g: string) => sourceGenres.has(g)).length;
        similarity += overlap * 20;

        // Price similarity
        if (sourceEvent.min_price && event.min_price) {
          const priceDiff = Math.abs(sourceEvent.min_price - event.min_price);
          similarity += Math.max(0, 20 - priceDiff / 5);
        }

        return { ...event, similarity_score: similarity };
      }).sort((a, b) => b.similarity_score - a.similarity_score);

      return NextResponse.json({ similar: scored || [] });
    }

    if (action === 'trending') {
      // Get trending based on recent sales velocity
      const { data: recentSales } = await supabase
        .from('orders')
        .select('event_id')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Count sales per event
      const salesCount: Record<string, number> = {};
      recentSales?.forEach(s => {
        if (s.event_id) {
          salesCount[s.event_id] = (salesCount[s.event_id] || 0) + 1;
        }
      });

      // Get top selling events
      const topEventIds = Object.entries(salesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      if (topEventIds.length === 0) {
        return NextResponse.json({ trending: [] });
      }

      const { data: trending } = await supabase
        .from('events')
        .select('id, name, event_date, venue_name, image_url, min_price')
        .in('id', topEventIds)
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString());

      // Add sales velocity
      const trendingWithVelocity = trending?.map(e => ({
        ...e,
        sales_velocity: salesCount[e.id] || 0,
      })).sort((a, b) => b.sales_velocity - a.sales_velocity);

      return NextResponse.json({ trending: trendingWithVelocity || [] });
    }

    if (action === 'collaborative') {
      // Collaborative filtering - "fans who attended X also attended Y"
      const eventId = searchParams.get('event_id');

      if (!eventId) {
        return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
      }

      // Get users who attended this event
      const { data: attendees } = await supabase
        .from('event_attendance')
        .select('user_id')
        .eq('event_id', eventId);

      const userIds = attendees?.map(a => a.user_id) || [];

      if (userIds.length === 0) {
        return NextResponse.json({ also_attended: [] });
      }

      // Get other events these users attended
      const { data: otherAttendance } = await supabase
        .from('event_attendance')
        .select('event_id')
        .in('user_id', userIds)
        .neq('event_id', eventId);

      // Count co-attendance
      const coAttendance: Record<string, number> = {};
      otherAttendance?.forEach(a => {
        coAttendance[a.event_id] = (coAttendance[a.event_id] || 0) + 1;
      });

      // Get top co-attended events
      const topEventIds = Object.entries(coAttendance)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      const { data: events } = await supabase
        .from('events')
        .select('id, name, event_date, venue_name, image_url, min_price')
        .in('id', topEventIds)
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString());

      return NextResponse.json({
        also_attended: events?.map(e => ({
          ...e,
          co_attendance_count: coAttendance[e.id],
        })) || [],
      });
    }

    if (action === 'demand_forecast') {
      // Forecast demand for upcoming events
      const { data: events } = await supabase
        .from('events')
        .select('id, name, event_date, venue_name, capacity, tickets_sold, genres')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .lte('event_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get historical data for similar events
      const forecasts = await Promise.all((events || []).map(async event => {
        // Find similar past events
        const { data: similarPast } = await supabase
          .from('events')
          .select('tickets_sold, capacity')
          .lt('event_date', new Date().toISOString())
          .overlaps('genres', event.genres || [])
          .limit(10);

        // Calculate average sell-through
        const avgSellThrough = similarPast?.length
          ? similarPast.reduce((sum, e) => sum + ((e.tickets_sold || 0) / (e.capacity || 1)), 0) / similarPast.length
          : 0.6;

        const predictedSales = Math.round((event.capacity || 1000) * avgSellThrough);
        const currentSales = event.tickets_sold || 0;
        const daysUntil = Math.ceil((new Date(event.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        return {
          event_id: event.id,
          event_name: event.name,
          event_date: event.event_date,
          current_sales: currentSales,
          predicted_total: predictedSales,
          capacity: event.capacity,
          predicted_sell_through: Math.round(avgSellThrough * 100),
          days_until_event: daysUntil,
          sales_velocity_needed: daysUntil > 0 ? Math.round((predictedSales - currentSales) / daysUntil) : 0,
          risk_level: currentSales < predictedSales * 0.5 && daysUntil < 14 ? 'high' : 'normal',
        };
      }));

      return NextResponse.json({ forecasts });
    }

    // Default: Get general recommendations
    const { data: featured } = await supabase
      .from('events')
      .select('id, name, event_date, venue_name, image_url, min_price')
      .eq('status', 'published')
      .eq('is_featured', true)
      .gte('event_date', new Date().toISOString())
      .limit(10);

    return NextResponse.json({ featured: featured || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

// POST /api/ai/recommendations - Log interactions for learning
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'log_interaction';

    if (action === 'log_interaction') {
      const { event_id, interaction_type, source } = body;

      await supabase.from('recommendation_interactions').insert({
        user_id: user.id,
        event_id,
        interaction_type, // view, click, purchase, dismiss
        source, // personalized, similar, trending, etc.
      });

      return NextResponse.json({ success: true });
    } else if (action === 'update_preferences') {
      const { genres, artists, venues, price_range } = body;

      await supabase
        .from('fan_profiles')
        .upsert({
          user_id: user.id,
          favorite_genres: genres,
          favorite_artists: artists,
          preferred_venues: venues,
          preferred_price_range: price_range,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      return NextResponse.json({ success: true });
    } else if (action === 'dismiss') {
      const { event_id } = body;

      await supabase.from('recommendation_dismissals').insert({
        user_id: user.id,
        event_id,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
