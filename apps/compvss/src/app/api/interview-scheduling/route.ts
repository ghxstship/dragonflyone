import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Screening and interview scheduling automation
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const opportunityId = searchParams.get('opportunity_id');

    let query = supabase.from('interviews').select(`
      *, application:job_applications(id, applicant_id),
      interviewers:interview_participants(user:platform_users(first_name, last_name))
    `);

    if (applicationId) query = query.eq('application_id', applicationId);
    if (opportunityId) query = query.eq('opportunity_id', opportunityId);

    const { data, error } = await query.order('scheduled_at', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ interviews: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'schedule') {
      const { application_id, opportunity_id, interview_type, scheduled_at, duration_minutes, location, interviewers } = body;

      const { data, error } = await supabase.from('interviews').insert({
        application_id, opportunity_id, interview_type, scheduled_at,
        duration_minutes: duration_minutes || 60, location, status: 'scheduled',
        created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (interviewers?.length) {
        await supabase.from('interview_participants').insert(
          interviewers.map((i: string) => ({ interview_id: data.id, user_id: i }))
        );
      }

      // Update application status
      await supabase.from('job_applications').update({ status: 'interviewing' }).eq('id', application_id);

      return NextResponse.json({ interview: data }, { status: 201 });
    }

    if (action === 'complete') {
      const { interview_id, feedback, rating, recommendation } = body;

      await supabase.from('interviews').update({
        status: 'completed', feedback, rating, recommendation,
        completed_at: new Date().toISOString()
      }).eq('id', interview_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
