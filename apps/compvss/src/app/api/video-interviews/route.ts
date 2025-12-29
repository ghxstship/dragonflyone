export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createSchema = z.object({
  action: z.literal('create'),
  application_id: z.string().uuid(),
  interview_type: z.string(),
  deadline: z.string().optional(),
  questions: z.array(z.object({
    question: z.string(),
    time_limit: z.number().optional(),
  })).optional(),
});

const submitResponseSchema = z.object({
  action: z.literal('submit_response'),
  interview_id: z.string().uuid(),
  question_id: z.string().uuid(),
  video_url: z.string().url(),
  duration_seconds: z.number().optional(),
});

const reviewSchema = z.object({
  action: z.literal('review'),
  interview_id: z.string().uuid(),
  rating: z.number().optional(),
  notes: z.string().optional(),
  recommendation: z.string().optional(),
});

const videoInterviewActionSchema = z.union([createSchema, submitResponseSchema, reviewSchema]);

// Video interview platform
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ interviews: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = videoInterviewActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { application_id, interview_type, questions, deadline } = validatedData as z.infer<typeof createSchema>;

      const { data, error } = await supabase.from('video_interviews').insert({
        application_id, interview_type, deadline, status: 'pending', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      interface InterviewQuestion { question: string; time_limit?: number }
      if (questions?.length) {
        await supabase.from('interview_questions').insert(
          questions.map((q: InterviewQuestion, i: number) => ({
            interview_id: data.id, question: q.question,
            time_limit: q.time_limit || 120, order: i + 1
          }))
        );
      }

      return NextResponse.json({ interview: data }, { status: 201 });
    }

    if (action === 'submit_response') {
      const { interview_id, question_id, video_url, duration_seconds } = validatedData as z.infer<typeof submitResponseSchema>;

      const { data, error } = await supabase.from('interview_responses').insert({
        interview_id, question_id, video_url, duration_seconds,
        submitted_by: user.id, submitted_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Check if all questions answered
      const { data: questions } = await supabase.from('interview_questions').select('id').eq('interview_id', interview_id);
      const { data: responses } = await supabase.from('interview_responses').select('question_id').eq('interview_id', interview_id);

      if (questions?.length === responses?.length) {
        await supabase.from('video_interviews').update({ status: 'completed' }).eq('id', interview_id);
      }

      return NextResponse.json({ response: data }, { status: 201 });
    }

    if (action === 'review') {
      const { interview_id, rating, notes, recommendation } = validatedData as z.infer<typeof reviewSchema>;

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
