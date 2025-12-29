export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const scheduleInterviewSchema = z.object({
  action: z.literal('schedule'),
  application_id: z.string().uuid(),
  opportunity_id: z.string().uuid().optional(),
  interview_type: z.string(),
  scheduled_at: z.string(),
  duration_minutes: z.number().optional(),
  location: z.string().optional(),
  interviewers: z.array(z.string().uuid()).optional(),
});

const completeInterviewSchema = z.object({
  action: z.literal('complete'),
  interview_id: z.string().uuid(),
  feedback: z.string().optional(),
  rating: z.number().optional(),
  recommendation: z.string().optional(),
});

const interviewActionSchema = z.union([scheduleInterviewSchema, completeInterviewSchema]);

// Screening and interview scheduling automation
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
    const applicationId = searchParams.get('application_id');
    const opportunityId = searchParams.get('opportunity_id');

    let query = supabase.from('interviews').select(`
      *, application:job_applications(id, applicant_id),
      interviewers:interview_participants(user:platform_users(first_name, last_name))
    `);

    if (applicationId) query = query.eq('application_id', applicationId);
    if (opportunityId) query = query.eq('opportunity_id', opportunityId);

    const { data, error } = await query.order('scheduled_at', { ascending: true });
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
    const validatedData = interviewActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'schedule') {
      const { application_id, opportunity_id, interview_type, scheduled_at, duration_minutes, location, interviewers } = validatedData as z.infer<typeof scheduleInterviewSchema>;

      const { data, error } = await supabase.from('interviews').insert({
        application_id, opportunity_id, interview_type, scheduled_at,
        duration_minutes: duration_minutes || 60, location, status: 'scheduled',
        created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
      const { interview_id, feedback, rating, recommendation } = validatedData as z.infer<typeof completeInterviewSchema>;

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
