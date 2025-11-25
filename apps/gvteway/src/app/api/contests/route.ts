import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Social media contest and giveaway management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabase.from('contests').select(`
      *, event:events(id, name), entries:contest_entries(count)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('end_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      contests: data,
      active: data?.filter(c => c.status === 'active') || [],
      upcoming: data?.filter(c => c.status === 'scheduled') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create_contest') {
      const { event_id, name, description, prize, entry_method, rules, start_date, end_date, max_entries } = body;

      const { data, error } = await supabase.from('contests').insert({
        event_id, name, description, prize, entry_method, rules,
        start_date, end_date, max_entries, status: 'scheduled', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ contest: data }, { status: 201 });
    }

    if (action === 'enter') {
      const { contest_id, entry_data } = body;

      // Check if already entered
      const { data: existing } = await supabase.from('contest_entries').select('id')
        .eq('contest_id', contest_id).eq('user_id', user.id).single();

      if (existing) {
        return NextResponse.json({ error: 'Already entered this contest' }, { status: 400 });
      }

      const { data, error } = await supabase.from('contest_entries').insert({
        contest_id, user_id: user.id, entry_data: entry_data || {},
        entered_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ entry: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (action === 'draw_winner') {
      const { data: entries } = await supabase.from('contest_entries').select('*').eq('contest_id', id);

      if (!entries || entries.length === 0) {
        return NextResponse.json({ error: 'No entries to draw from' }, { status: 400 });
      }

      const winnerIndex = Math.floor(Math.random() * entries.length);
      const winner = entries[winnerIndex];

      await supabase.from('contests').update({
        winner_id: winner.user_id, status: 'completed', drawn_at: new Date().toISOString()
      }).eq('id', id);

      await supabase.from('contest_entries').update({ is_winner: true }).eq('id', winner.id);

      return NextResponse.json({ winner, total_entries: entries.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
