import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Encore management
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('encores').select(`
      *, artist:artists(id, name)
    `).eq('event_id', eventId).order('sequence', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ encores: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { event_id, artist_id, sequence, songs, duration_minutes, curfew_check } = body;

    // Check curfew if needed
    if (curfew_check) {
      const { data: timing } = await supabase.from('show_timings').select('actual_time')
        .eq('event_id', event_id).eq('timing_type', 'curfew').single();

      if (timing) {
        const curfewTime = new Date(timing.actual_time);
        const now = new Date();
        const minutesRemaining = (curfewTime.getTime() - now.getTime()) / 60000;

        if (minutesRemaining < duration_minutes) {
          return NextResponse.json({
            warning: 'Encore may exceed curfew',
            minutes_remaining: Math.round(minutesRemaining),
            encore_duration: duration_minutes
          });
        }
      }
    }

    const { data, error } = await supabase.from('encores').insert({
      event_id, artist_id, sequence, songs: songs || [],
      duration_minutes, status: 'planned'
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ encore: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, status, actual_start, actual_end } = body;

    await supabase.from('encores').update({
      status, actual_start, actual_end
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
