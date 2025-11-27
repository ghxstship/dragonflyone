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
    const questionId = params.id;

    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    // Get current question
    const { data: question, error: fetchError } = await supabase
      .from('qa_questions')
      .select('upvotes')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Check if user already upvoted (if authenticated)
    if (userId) {
      const { data: existingVote } = await supabase
        .from('qa_question_votes')
        .select('id')
        .eq('question_id', questionId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        // Remove upvote
        await supabase
          .from('qa_question_votes')
          .delete()
          .eq('question_id', questionId)
          .eq('user_id', userId);

        await supabase
          .from('qa_questions')
          .update({ upvotes: Math.max(0, (question.upvotes || 0) - 1) })
          .eq('id', questionId);

        return NextResponse.json({ upvoted: false, upvotes: Math.max(0, (question.upvotes || 0) - 1) });
      }

      // Add upvote record
      await supabase
        .from('qa_question_votes')
        .insert({ question_id: questionId, user_id: userId });
    }

    // Increment upvote count
    const { error: updateError } = await supabase
      .from('qa_questions')
      .update({ upvotes: (question.upvotes || 0) + 1 })
      .eq('id', questionId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ upvoted: true, upvotes: (question.upvotes || 0) + 1 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
