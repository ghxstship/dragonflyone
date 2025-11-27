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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const sessionId = params.id;

    const { data, error } = await supabase
      .from('qa_questions')
      .select(`
        *,
        user:platform_users(id, first_name, last_name)
      `)
      .eq('session_id', sessionId)
      .eq('status', 'approved')
      .order('upvotes', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const questions = data?.map(q => ({
      id: q.id,
      session_id: q.session_id,
      user_id: q.user_id,
      user_name: q.user ? `${(q.user as any).first_name} ${(q.user as any).last_name}` : 'Anonymous',
      content: q.content,
      upvotes: q.upvotes || 0,
      is_answered: q.is_answered || false,
      answer: q.answer,
      answered_at: q.answered_at,
      created_at: q.created_at,
    })) || [];

    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const sessionId = params.id;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Question content is required' }, { status: 400 });
    }

    // Check if session exists and is accepting questions
    const { data: session } = await supabase
      .from('qa_sessions')
      .select('status, is_member_only')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'upcoming' && session.status !== 'live') {
      return NextResponse.json({ error: 'Session is not accepting questions' }, { status: 400 });
    }

    // Check membership if required
    if (session.is_member_only) {
      const { data: membership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'This session is for members only' }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('qa_questions')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        content: content.trim(),
        upvotes: 0,
        is_answered: false,
        status: 'pending', // Requires moderation
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update question count
    await supabase.rpc('increment_qa_questions_count', { session_id: sessionId });

    return NextResponse.json({ question: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
