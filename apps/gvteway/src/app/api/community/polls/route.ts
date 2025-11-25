import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const category = searchParams.get('category');

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    let query = supabase
      .from('community_polls')
      .select(`
        *,
        events (
          id,
          title
        ),
        poll_options (
          id,
          text,
          votes_count
        )
      `)
      .order('created_at', { ascending: false });

    if (status === 'active') {
      query = query.eq('status', 'active');
    } else if (status === 'closed') {
      query = query.eq('status', 'closed');
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user's votes if authenticated
    let userVotes: Record<string, string> = {};
    if (userId && data) {
      const pollIds = data.map(p => p.id);
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('poll_id, option_id')
        .eq('user_id', userId)
        .in('poll_id', pollIds);

      if (votes) {
        userVotes = votes.reduce((acc, v) => {
          acc[v.poll_id] = v.option_id;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    const polls = data?.map(poll => {
      const options = (poll.poll_options as any[]) || [];
      const totalVotes = options.reduce((sum, o) => sum + (o.votes_count || 0), 0);

      return {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        options: options.map(o => ({
          id: o.id,
          text: o.text,
          votes: o.votes_count || 0,
          percentage: totalVotes > 0 ? Math.round((o.votes_count || 0) / totalVotes * 100) : 0,
        })),
        total_votes: totalVotes,
        status: poll.status,
        ends_at: poll.ends_at,
        created_at: poll.created_at,
        event_id: poll.event_id,
        event_title: (poll.events as any)?.title,
        user_voted: userVotes[poll.id] || null,
        category: poll.category || 'general',
      };
    }) || [];

    return NextResponse.json({ polls });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
