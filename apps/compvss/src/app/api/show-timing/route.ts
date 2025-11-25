import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Doors time, set time, curfew tracking
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('show_timings').select('*').eq('event_id', eventId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ timings: data });
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
    const { action, event_id } = body;

    if (action === 'record_doors') {
      const { actual_time } = body;
      await supabase.from('show_timings').upsert({
        event_id, timing_type: 'doors', actual_time, recorded_by: user.id
      }, { onConflict: 'event_id,timing_type' });
      return NextResponse.json({ success: true });
    }

    if (action === 'record_set') {
      const { artist_id, set_start, set_end } = body;
      await supabase.from('show_timings').insert({
        event_id, timing_type: 'set', artist_id, actual_time: set_start,
        end_time: set_end, recorded_by: user.id
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'record_curfew') {
      const { actual_time, exceeded } = body;
      await supabase.from('show_timings').upsert({
        event_id, timing_type: 'curfew', actual_time, exceeded, recorded_by: user.id
      }, { onConflict: 'event_id,timing_type' });

      if (exceeded) {
        await supabase.from('curfew_alerts').insert({
          event_id, exceeded_at: actual_time, recorded_by: user.id
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
