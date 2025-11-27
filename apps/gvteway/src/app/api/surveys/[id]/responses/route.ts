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

    // Check if user already responded
    const { data: existing } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('survey_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
    }

    const body = await request.json();

    // Create response
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id: params.id,
        user_id: user.id,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (responseError) {
      return NextResponse.json({ error: responseError.message }, { status: 500 });
    }

    // Insert answers
    const answerRecords = Object.entries(body.answers).map(([questionId, value]) => ({
      response_id: response.id,
      question_id: questionId,
      answer: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }));

    const { error: answersError } = await supabase
      .from('survey_answers')
      .insert(answerRecords);

    if (answersError) {
      return NextResponse.json({ error: answersError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, response_id: response.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
