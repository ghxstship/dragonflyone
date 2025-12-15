export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
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
      .select('*')
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
      // Handle missing table or relationship errors - return empty data
      return NextResponse.json({ polls: [] });
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

    const polls = data?.map(poll => ({
      id: poll.id,
      question: poll.question,
      description: poll.description,
      options: [],
      total_votes: poll.total_votes || 0,
      status: poll.status,
      ends_at: poll.ends_at,
      created_at: poll.created_at,
      event_id: poll.event_id,
      user_voted: userVotes[poll.id] || null,
      category: poll.category || 'general',
    })) || [];

    return NextResponse.json({ polls });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ polls: [] });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
