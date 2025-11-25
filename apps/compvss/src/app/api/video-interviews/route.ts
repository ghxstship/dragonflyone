import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Video interview platform
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interview_id');
    const applicationId = searchParams.get('application_id');

    if (interviewId) {
      const { data } = await supabase.from('video_interviews').select(`
        *, questions:interview_questions(id, question, time_limit, order)
      `).eq('id', interviewId).single();

      return NextResponse.json({ interview: data });
    }

    let query = supabase.from('video_interviews').select('*');
    if (applicationId) query = query.eq('application_id', applicationId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ interviews: data });
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
      const { application_id, interview_type, questions, deadline } = body;

      const { data, error } = await supabase.from('video_interviews').insert({
        application_id, interview_type, deadline, status: 'pending', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (questions?.length) {
        await supabase.from('interview_questions').insert(
          questions.map((q: any, i: number) => ({
            interview_id: data.id, question: q.question,
            time_limit: q.time_limit || 120, order: i + 1
          }))
        );
      }

      return NextResponse.json({ interview: data }, { status: 201 });
    }

    if (action === 'submit_response') {
      const { interview_id, question_id, video_url, duration_seconds } = body;

      const { data, error } = await supabase.from('interview_responses').insert({
        interview_id, question_id, video_url, duration_seconds,
        submitted_by: user.id, submitted_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Check if all questions answered
      const { data: questions } = await supabase.from('interview_questions').select('id').eq('interview_id', interview_id);
      const { data: responses } = await supabase.from('interview_responses').select('question_id').eq('interview_id', interview_id);

      if (questions?.length === responses?.length) {
        await supabase.from('video_interviews').update({ status: 'completed' }).eq('id', interview_id);
      }

      return NextResponse.json({ response: data }, { status: 201 });
    }

    if (action === 'review') {
      const { interview_id, rating, notes, recommendation } = body;

      await supabase.from('video_interviews').update({
        status: 'reviewed', rating, reviewer_notes: notes,
        recommendation, reviewed_by: user.id, reviewed_at: new Date().toISOString()
      }).eq('id', interview_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
