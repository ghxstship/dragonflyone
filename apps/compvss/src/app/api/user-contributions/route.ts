import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// User contribution and crowdsourcing features
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const category = searchParams.get('category');

    let query = supabase.from('user_contributions').select(`
      *, author:platform_users(first_name, last_name),
      votes:contribution_votes(vote_type)
    `);

    if (status !== 'all') query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate vote scores
    const withScores = data?.map(c => ({
      ...c,
      score: (c.votes?.filter((v: any) => v.vote_type === 'up').length || 0) -
             (c.votes?.filter((v: any) => v.vote_type === 'down').length || 0)
    }));

    return NextResponse.json({ contributions: withScores });
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

    if (action === 'submit') {
      const { category, title, content, tags } = body;

      const { data, error } = await supabase.from('user_contributions').insert({
        category, title, content, tags: tags || [],
        author_id: user.id, status: 'pending'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ contribution: data }, { status: 201 });
    }

    if (action === 'vote') {
      const { contribution_id, vote_type } = body;

      await supabase.from('contribution_votes').upsert({
        contribution_id, user_id: user.id, vote_type
      }, { onConflict: 'contribution_id,user_id' });

      return NextResponse.json({ success: true });
    }

    if (action === 'moderate') {
      const { contribution_id, status, feedback } = body;

      await supabase.from('user_contributions').update({
        status, moderator_feedback: feedback, moderated_by: user.id,
        moderated_at: new Date().toISOString()
      }).eq('id', contribution_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'publish') {
      const { contribution_id, document_id } = body;

      // Link contribution to published document
      await supabase.from('user_contributions').update({
        status: 'published', published_document_id: document_id
      }).eq('id', contribution_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
