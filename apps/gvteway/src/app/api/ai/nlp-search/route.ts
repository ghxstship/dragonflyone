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


// GET /api/ai/nlp-search - Natural language processing for search
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const action = searchParams.get('action');

    if (!query && action !== 'suggestions') {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    if (action === 'suggestions') {
      // Get popular searches
      const { data: popular } = await supabase
        .from('search_analytics')
        .select('query, count')
        .order('count', { ascending: false })
        .limit(10);

      // Get recent searches for user
      const authHeader = request.headers.get('authorization');
      let recentSearches: string[] = [];

      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) {
          const { data: recent } = await supabase
            .from('user_searches')
            .select('query')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

          recentSearches = recent?.map(r => r.query) || [];
        }
      }

      return NextResponse.json({
        popular: popular?.map(p => p.query) || [],
        recent: recentSearches,
      });
    }

    // Parse natural language query
    const parsedQuery = parseNaturalLanguageQuery(query!);

    // Build search based on parsed intent
    let results: any = {};

    if (parsedQuery.intent === 'event_search') {
      results = await searchEvents(parsedQuery);
    } else if (parsedQuery.intent === 'artist_search') {
      results = await searchArtists(parsedQuery);
    } else if (parsedQuery.intent === 'venue_search') {
      results = await searchVenues(parsedQuery);
    } else if (parsedQuery.intent === 'date_search') {
      results = await searchByDate(parsedQuery);
    } else if (parsedQuery.intent === 'price_search') {
      results = await searchByPrice(parsedQuery);
    } else {
      // General search across all entities
      results = await generalSearch(parsedQuery);
    }

    // Log search for analytics
    await logSearch(query!, parsedQuery, results);

    return NextResponse.json({
      query: query,
      parsed: parsedQuery,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// POST /api/ai/nlp-search - Log search interaction
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
    const { query, clicked_result_id, clicked_result_type } = body;

    // Log user search
    await supabase.from('user_searches').insert({
      user_id: user.id,
      query,
      clicked_result_id,
      clicked_result_type,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log search' }, { status: 500 });
  }
}

// Natural language query parser
interface ParsedQuery {
  intent: string;
  entities: {
    genres: string[];
    locations: string[];
    dates: { start?: string; end?: string; relative?: string };
    priceRange: { min?: number; max?: number };
    artists: string[];
    keywords: string[];
  };
  originalQuery: string;
}

function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);

  const parsed: ParsedQuery = {
    intent: 'general',
    entities: {
      genres: [],
      locations: [],
      dates: {},
      priceRange: {},
      artists: [],
      keywords: [],
    },
    originalQuery: query,
  };

  // Genre detection
  const genres = ['rock', 'pop', 'jazz', 'classical', 'hip-hop', 'electronic', 'country', 'r&b', 'metal', 'indie', 'folk', 'blues', 'reggae', 'latin', 'punk'];
  genres.forEach(genre => {
    if (lowerQuery.includes(genre)) {
      parsed.entities.genres.push(genre);
      parsed.intent = 'event_search';
    }
  });

  // Date detection
  if (lowerQuery.includes('tonight') || lowerQuery.includes('today')) {
    parsed.entities.dates.relative = 'today';
    parsed.intent = 'date_search';
  } else if (lowerQuery.includes('tomorrow')) {
    parsed.entities.dates.relative = 'tomorrow';
    parsed.intent = 'date_search';
  } else if (lowerQuery.includes('this weekend') || lowerQuery.includes('weekend')) {
    parsed.entities.dates.relative = 'weekend';
    parsed.intent = 'date_search';
  } else if (lowerQuery.includes('this week')) {
    parsed.entities.dates.relative = 'week';
    parsed.intent = 'date_search';
  } else if (lowerQuery.includes('this month')) {
    parsed.entities.dates.relative = 'month';
    parsed.intent = 'date_search';
  }

  // Month detection
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  months.forEach((month, index) => {
    if (lowerQuery.includes(month)) {
      const year = new Date().getFullYear();
      const monthNum = index + 1;
      parsed.entities.dates.start = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
      parsed.entities.dates.end = `${year}-${monthNum.toString().padStart(2, '0')}-${new Date(year, monthNum, 0).getDate()}`;
      parsed.intent = 'date_search';
    }
  });

  // Price detection
  const priceMatch = lowerQuery.match(/under\s*\$?(\d+)/);
  if (priceMatch) {
    parsed.entities.priceRange.max = parseInt(priceMatch[1]);
    parsed.intent = 'price_search';
  }

  const cheapMatch = lowerQuery.match(/cheap|budget|affordable/);
  if (cheapMatch) {
    parsed.entities.priceRange.max = 50;
    parsed.intent = 'price_search';
  }

  const freeMatch = lowerQuery.match(/free/);
  if (freeMatch) {
    parsed.entities.priceRange.max = 0;
    parsed.intent = 'price_search';
  }

  // Location detection
  const locationIndicators = ['in', 'at', 'near', 'around'];
  locationIndicators.forEach(indicator => {
    const regex = new RegExp(`${indicator}\\s+([a-zA-Z\\s]+?)(?:\\s+(?:this|next|on|for)|$)`, 'i');
    const match = query.match(regex);
    if (match) {
      parsed.entities.locations.push(match[1].trim());
    }
  });

  // Artist/venue intent detection
  if (lowerQuery.includes('concert') || lowerQuery.includes('show') || lowerQuery.includes('tour')) {
    parsed.intent = 'event_search';
  }

  if (lowerQuery.includes('venue') || lowerQuery.includes('theater') || lowerQuery.includes('arena') || lowerQuery.includes('stadium')) {
    parsed.intent = 'venue_search';
  }

  // Extract remaining keywords
  const stopWords = new Set(['the', 'a', 'an', 'in', 'at', 'on', 'for', 'to', 'of', 'and', 'or', 'this', 'next', 'near', 'around', 'show', 'concert', 'event', 'events', 'tickets', 'ticket']);
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 2) {
      if (!parsed.entities.genres.includes(word) && !months.includes(word)) {
        parsed.entities.keywords.push(word);
      }
    }
  });

  return parsed;
}

async function searchEvents(parsed: ParsedQuery) {
  let query = supabase
    .from('events')
    .select('id, name, event_date, venue_name, venue_city, image_url, min_price, genres')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString());

  if (parsed.entities.genres.length > 0) {
    query = query.overlaps('genres', parsed.entities.genres);
  }

  if (parsed.entities.locations.length > 0) {
    query = query.or(parsed.entities.locations.map(loc => `venue_city.ilike.%${loc}%`).join(','));
  }

  const { data } = await query.order('event_date').limit(20);
  return { events: data || [] };
}

async function searchArtists(parsed: ParsedQuery) {
  let query = supabase
    .from('artists')
    .select('id, name, image_url, genres, bio');

  if (parsed.entities.keywords.length > 0) {
    query = query.or(parsed.entities.keywords.map(kw => `name.ilike.%${kw}%`).join(','));
  }

  if (parsed.entities.genres.length > 0) {
    query = query.overlaps('genres', parsed.entities.genres);
  }

  const { data } = await query.limit(10);
  return { artists: data || [] };
}

async function searchVenues(parsed: ParsedQuery) {
  let query = supabase
    .from('venues')
    .select('id, name, city, state, capacity, image_url');

  if (parsed.entities.locations.length > 0) {
    query = query.or(parsed.entities.locations.map(loc => `city.ilike.%${loc}%`).join(','));
  }

  if (parsed.entities.keywords.length > 0) {
    query = query.or(parsed.entities.keywords.map(kw => `name.ilike.%${kw}%`).join(','));
  }

  const { data } = await query.limit(10);
  return { venues: data || [] };
}

async function searchByDate(parsed: ParsedQuery) {
  let startDate: Date;
  let endDate: Date;
  const now = new Date();

  switch (parsed.entities.dates.relative) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'tomorrow':
      startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'weekend':
      const dayOfWeek = now.getDay();
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      startDate = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate = now;
      endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = now;
      endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      if (parsed.entities.dates.start) {
        startDate = new Date(parsed.entities.dates.start);
        endDate = parsed.entities.dates.end ? new Date(parsed.entities.dates.end) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        startDate = now;
        endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
  }

  let query = supabase
    .from('events')
    .select('id, name, event_date, venue_name, venue_city, image_url, min_price')
    .eq('status', 'published')
    .gte('event_date', startDate.toISOString())
    .lte('event_date', endDate.toISOString());

  if (parsed.entities.genres.length > 0) {
    query = query.overlaps('genres', parsed.entities.genres);
  }

  const { data } = await query.order('event_date').limit(20);
  return { events: data || [], date_range: { start: startDate, end: endDate } };
}

async function searchByPrice(parsed: ParsedQuery) {
  let query = supabase
    .from('events')
    .select('id, name, event_date, venue_name, venue_city, image_url, min_price')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString());

  if (parsed.entities.priceRange.max !== undefined) {
    if (parsed.entities.priceRange.max === 0) {
      query = query.eq('min_price', 0);
    } else {
      query = query.lte('min_price', parsed.entities.priceRange.max);
    }
  }

  if (parsed.entities.priceRange.min !== undefined) {
    query = query.gte('min_price', parsed.entities.priceRange.min);
  }

  const { data } = await query.order('min_price').limit(20);
  return { events: data || [] };
}

async function generalSearch(parsed: ParsedQuery) {
  const keywords = parsed.entities.keywords.join(' ');

  // Search events
  const { data: events } = await supabase
    .from('events')
    .select('id, name, event_date, venue_name, image_url, min_price')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .ilike('name', `%${keywords}%`)
    .limit(10);

  // Search artists
  const { data: artists } = await supabase
    .from('artists')
    .select('id, name, image_url')
    .ilike('name', `%${keywords}%`)
    .limit(5);

  // Search venues
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, city, image_url')
    .ilike('name', `%${keywords}%`)
    .limit(5);

  return {
    events: events || [],
    artists: artists || [],
    venues: venues || [],
  };
}

async function logSearch(query: string, parsed: ParsedQuery, results: any) {
  // Update search analytics
  await supabase.rpc('upsert_search_analytics', {
    p_query: query.toLowerCase().trim(),
  });
}
