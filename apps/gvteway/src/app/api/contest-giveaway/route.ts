import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Contest and giveaway management
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status') || 'active';

    let query = supabase.from('contests').select(`
      *, entries:contest_entries(count), winners:contest_winners(user:platform_users(first_name, last_name))
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (status !== 'all') query = query.eq('status', status);

    const { data, error } = await query.order('end_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ contests: data });
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
    const { action } = body;

    if (action === 'create') {
      const { event_id, title, description, prize, entry_method, start_date, end_date, rules, max_entries } = body;

      const { data, error } = await supabase.from('contests').insert({
        event_id, title, description, prize, entry_method,
        start_date, end_date, rules, max_entries, status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ contest: data }, { status: 201 });
    }

    if (action === 'enter') {
      const { contest_id, entry_data } = body;

      // Check if already entered
      const { data: existing } = await supabase.from('contest_entries').select('id')
        .eq('contest_id', contest_id).eq('user_id', user.id);

      const { data: contest } = await supabase.from('contests').select('max_entries').eq('id', contest_id).single();

      if (existing && existing.length >= (contest?.max_entries || 1)) {
        return NextResponse.json({ error: 'Maximum entries reached' }, { status: 400 });
      }

      const { data, error } = await supabase.from('contest_entries').insert({
        contest_id, user_id: user.id, entry_data: entry_data || {}
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ entry: data }, { status: 201 });
    }

    if (action === 'draw_winners') {
      const { contest_id, num_winners } = body;

      // Get all entries
      const { data: entries } = await supabase.from('contest_entries').select('user_id').eq('contest_id', contest_id);

      if (!entries?.length) return NextResponse.json({ error: 'No entries' }, { status: 400 });

      // Random selection
      const shuffled = entries.sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, num_winners || 1);

      // Record winners
      await supabase.from('contest_winners').insert(
        winners.map((w, i) => ({ contest_id, user_id: w.user_id, position: i + 1 }))
      );

      await supabase.from('contests').update({ status: 'completed' }).eq('id', contest_id);

      return NextResponse.json({ winners });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
