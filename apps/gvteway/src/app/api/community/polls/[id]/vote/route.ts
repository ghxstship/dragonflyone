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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { option_id } = body;

    if (!option_id) {
      return NextResponse.json({ error: 'Option ID is required' }, { status: 400 });
    }

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from('community_polls')
      .select('id, status, ends_at')
      .eq('id', params.id)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (poll.status !== 'active') {
      return NextResponse.json({ error: 'Poll is not active' }, { status: 400 });
    }

    if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
      return NextResponse.json({ error: 'Poll has ended' }, { status: 400 });
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // Record vote
    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: params.id,
        option_id,
        user_id: user.id,
      });

    if (voteError) {
      return NextResponse.json({ error: voteError.message }, { status: 500 });
    }

    // Increment vote count
    await supabase.rpc('increment_poll_option_votes', { p_option_id: option_id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
