import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const crewId = searchParams.get('crew_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase.from('crew_availability').select(`
      *, crew:platform_users(id, email, first_name, last_name)
    `);

    if (crewId) query = query.eq('crew_id', crewId);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query.order('date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get blackout dates
    const { data: blackouts } = await supabase.from('crew_blackout_dates').select('*')
      .gte('end_date', startDate || new Date().toISOString());

    return NextResponse.json({
      availability: data,
      blackout_dates: blackouts,
      summary: {
        available: data?.filter(a => a.status === 'available').length || 0,
        unavailable: data?.filter(a => a.status === 'unavailable').length || 0,
        tentative: data?.filter(a => a.status === 'tentative').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { crew_id, date, status, start_time, end_time, notes, is_blackout, blackout_reason } = body;

    if (is_blackout) {
      const { data, error } = await supabase.from('crew_blackout_dates').insert({
        crew_id: crew_id || user.id,
        start_date: date,
        end_date: body.end_date || date,
        reason: blackout_reason
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ blackout: data }, { status: 201 });
    }

    const { data, error } = await supabase.from('crew_availability').insert({
      crew_id: crew_id || user.id, date, status, start_time, end_time, notes
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ availability: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set availability' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // 'availability' or 'blackout'

    const table = type === 'blackout' ? 'crew_blackout_dates' : 'crew_availability';
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
