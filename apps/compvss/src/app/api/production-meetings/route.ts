export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createMeetingSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  scheduled_at: z.string(),
  duration_minutes: z.number().optional(),
  location: z.string().optional(),
  meeting_type: z.string().optional(),
  attendee_ids: z.array(z.string().uuid()).optional(),
  agenda: z.array(z.string()).optional(),
});

const addMinutesSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('add_minutes'),
  content: z.string(),
  action_items: z.array(z.record(z.unknown())).optional(),
  decisions: z.array(z.string()).optional(),
});

const respondMeetingSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('respond'),
  response: z.enum(['accepted', 'declined', 'tentative']),
});

const cancelMeetingSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('cancel'),
});

const meetingPatchSchema = z.union([addMinutesSchema, respondMeetingSchema, cancelMeetingSchema]);

// Production meeting scheduling and automated minutes
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
    const projectId = searchParams.get('project_id');
    const upcoming = searchParams.get('upcoming') === 'true';

    let query = supabase.from('production_meetings').select(`
      *, organizer:platform_users(id, first_name, last_name),
      attendees:meeting_attendees(user:platform_users(id, first_name, last_name), status),
      minutes:meeting_minutes(id, content, action_items)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (upcoming) query = query.gte('scheduled_at', new Date().toISOString());

    const { data, error } = await query.order('scheduled_at', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ meetings: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
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
    const validatedData = createMeetingSchema.parse(body);
    const { project_id, title, description, scheduled_at, duration_minutes, location, meeting_type, attendee_ids, agenda } = validatedData;

    const { data: meeting, error } = await supabase.from('production_meetings').insert({
      project_id, title, description, scheduled_at, duration_minutes,
      location, meeting_type, agenda: agenda || [], organizer_id: user.id, status: 'scheduled'
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Add attendees
    if (attendee_ids?.length) {
      const attendeeRecords = attendee_ids.map((id: string) => ({
        meeting_id: meeting.id, user_id: id, status: 'pending'
      }));
      await supabase.from('meeting_attendees').insert(attendeeRecords);

      // Send notifications
      for (const id of attendee_ids) {
        await supabase.from('notifications').insert({
          user_id: id, type: 'meeting_invite',
          title: `Meeting: ${title}`,
          message: `You've been invited to a meeting on ${new Date(scheduled_at).toLocaleDateString()}`,
          reference_id: meeting.id
        });
      }
    }

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const validatedData = meetingPatchSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'add_minutes') {
      const { content, action_items, decisions } = validatedData as z.infer<typeof addMinutesSchema>;

      const { data, error } = await supabase.from('meeting_minutes').insert({
        meeting_id: id, content, action_items: action_items || [],
        decisions: decisions || [], recorded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Update meeting status
      await supabase.from('production_meetings').update({ status: 'completed' }).eq('id', id);

      return NextResponse.json({ minutes: data });
    }

    if (action === 'respond') {
      const { response } = validatedData as z.infer<typeof respondMeetingSchema>;
      await supabase.from('meeting_attendees').update({ status: response })
        .eq('meeting_id', id).eq('user_id', user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'cancel') {
      await supabase.from('production_meetings').update({ status: 'cancelled' }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
