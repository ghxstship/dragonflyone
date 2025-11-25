import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Voice search capability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, audio_url } = body;

    // Parse natural language query
    const parsed = parseVoiceQuery(transcript);

    // Build search query
    let query = supabase.from('events').select('*')
      .gte('date', new Date().toISOString())
      .eq('status', 'published');

    if (parsed.artist) {
      query = query.ilike('artist_name', `%${parsed.artist}%`);
    }
    if (parsed.venue) {
      query = query.ilike('venue', `%${parsed.venue}%`);
    }
    if (parsed.city) {
      query = query.ilike('city', `%${parsed.city}%`);
    }
    if (parsed.genre) {
      query = query.eq('genre', parsed.genre);
    }
    if (parsed.date_range) {
      query = query.gte('date', parsed.date_range.start).lte('date', parsed.date_range.end);
    }

    const { data: events, error } = await query.limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      transcript,
      parsed_query: parsed,
      results: events,
      suggestions: generateSuggestions(parsed, events || [])
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process voice search' }, { status: 500 });
  }
}

function parseVoiceQuery(transcript: string): any {
  const lower = transcript.toLowerCase();
  const parsed: any = { original: transcript };

  // Extract artist
  const artistMatch = lower.match(/(?:by|see|watch|hear)\s+([a-z\s]+?)(?:\s+(?:in|at|on|this|next)|$)/);
  if (artistMatch) parsed.artist = artistMatch[1].trim();

  // Extract venue
  const venueMatch = lower.match(/(?:at|venue)\s+([a-z\s]+?)(?:\s+(?:on|this|next)|$)/);
  if (venueMatch) parsed.venue = venueMatch[1].trim();

  // Extract city
  const cityMatch = lower.match(/(?:in|near)\s+([a-z\s]+?)(?:\s+(?:on|this|next)|$)/);
  if (cityMatch) parsed.city = cityMatch[1].trim();

  // Extract date
  if (lower.includes('tonight')) {
    const today = new Date();
    parsed.date_range = { start: today.toISOString(), end: new Date(today.setHours(23, 59, 59)).toISOString() };
  } else if (lower.includes('this weekend')) {
    const today = new Date();
    const saturday = new Date(today.setDate(today.getDate() + (6 - today.getDay())));
    const sunday = new Date(saturday);
    sunday.setDate(sunday.getDate() + 1);
    parsed.date_range = { start: saturday.toISOString(), end: sunday.toISOString() };
  } else if (lower.includes('next week')) {
    const today = new Date();
    const nextWeek = new Date(today.setDate(today.getDate() + 7));
    parsed.date_range = { start: new Date().toISOString(), end: nextWeek.toISOString() };
  }

  // Extract genre
  const genres = ['rock', 'pop', 'hip hop', 'jazz', 'classical', 'electronic', 'country', 'r&b'];
  for (const genre of genres) {
    if (lower.includes(genre)) {
      parsed.genre = genre;
      break;
    }
  }

  return parsed;
}

function generateSuggestions(parsed: any, results: any[]): string[] {
  const suggestions: string[] = [];
  
  if (results.length === 0) {
    suggestions.push('Try searching for a different artist or date');
    suggestions.push('Browse all upcoming events');
  } else if (results.length > 10) {
    suggestions.push('Add a specific date to narrow results');
    suggestions.push('Specify a venue or city');
  }

  return suggestions;
}
