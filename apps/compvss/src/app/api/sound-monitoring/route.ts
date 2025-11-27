import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Sound level monitoring (dB tracking)
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data: readings } = await supabase.from('sound_readings').select('*')
      .eq('event_id', eventId).order('recorded_at', { ascending: false }).limit(100);

    const { data: limits } = await supabase.from('sound_limits').select('*')
      .eq('event_id', eventId).single();

    // Calculate stats
    const dbValues = readings?.map(r => r.db_level) || [];
    const avg = dbValues.length ? dbValues.reduce((s, v) => s + v, 0) / dbValues.length : 0;
    const max = dbValues.length ? Math.max(...dbValues) : 0;
    const violations = readings?.filter(r => r.db_level > (limits?.max_db || 105)).length || 0;

    return NextResponse.json({
      readings,
      limits,
      stats: {
        average_db: Math.round(avg * 10) / 10,
        max_db: max,
        violations,
        current: readings?.[0]?.db_level || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, event_id } = body;

    if (action === 'record') {
      const { db_level, location } = body;

      const { data: limits } = await supabase.from('sound_limits').select('max_db')
        .eq('event_id', event_id).single();

      const isViolation = db_level > (limits?.max_db || 105);

      const { data, error } = await supabase.from('sound_readings').insert({
        event_id, db_level, location, is_violation: isViolation,
        recorded_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (isViolation) {
        await supabase.from('sound_violations').insert({
          event_id, db_level, limit_db: limits?.max_db || 105, location
        });
      }

      return NextResponse.json({ reading: data, violation: isViolation }, { status: 201 });
    }

    if (action === 'set_limits') {
      const { max_db, warning_db } = body;

      await supabase.from('sound_limits').upsert({
        event_id, max_db, warning_db
      }, { onConflict: 'event_id' });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
