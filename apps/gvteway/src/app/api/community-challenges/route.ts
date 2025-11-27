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

// Community challenges and competitions
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const artistId = searchParams.get('artist_id');

    let query = supabase.from('community_challenges').select(`
      *, artist:artists(id, name), participants:challenge_participants(count),
      prizes:challenge_prizes(id, place, prize_description, prize_value)
    `);

    if (status) query = query.eq('status', status);
    if (artistId) query = query.eq('artist_id', artistId);

    const { data, error } = await query.order('end_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const now = new Date();
    return NextResponse.json({
      challenges: data,
      active: data?.filter(c => c.status === 'active' && new Date(c.end_date) > now) || [],
      upcoming: data?.filter(c => c.status === 'scheduled') || [],
      completed: data?.filter(c => c.status === 'completed') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'join') {
      const { challenge_id } = body;

      // Check if already participating
      const { data: existing } = await supabase.from('challenge_participants').select('id')
        .eq('challenge_id', challenge_id).eq('user_id', user.id).single();

      if (existing) {
        return NextResponse.json({ error: 'Already participating' }, { status: 400 });
      }

      const { data, error } = await supabase.from('challenge_participants').insert({
        challenge_id, user_id: user.id, joined_at: new Date().toISOString(),
        status: 'active', score: 0
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ participation: data }, { status: 201 });
    }

    if (action === 'submit_entry') {
      const { challenge_id, entry_type, content_url, description } = body;

      const { data, error } = await supabase.from('challenge_entries').insert({
        challenge_id, user_id: user.id, entry_type, content_url, description,
        submitted_at: new Date().toISOString(), status: 'pending_review'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ entry: data }, { status: 201 });
    }

    if (action === 'vote') {
      const { entry_id } = body;

      // Check if already voted
      const { data: existing } = await supabase.from('challenge_votes').select('id')
        .eq('entry_id', entry_id).eq('user_id', user.id).single();

      if (existing) {
        return NextResponse.json({ error: 'Already voted' }, { status: 400 });
      }

      await supabase.from('challenge_votes').insert({
        entry_id, user_id: user.id, voted_at: new Date().toISOString()
      });

      // Update entry vote count
      await supabase.rpc('increment_entry_votes', { entry_id });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
