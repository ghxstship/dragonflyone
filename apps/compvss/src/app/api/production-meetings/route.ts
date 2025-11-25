import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Production meeting scheduling and automated minutes
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ meetings: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { project_id, title, description, scheduled_at, duration_minutes, location, meeting_type, attendee_ids, agenda } = body;

    const { data: meeting, error } = await supabase.from('production_meetings').insert({
      project_id, title, description, scheduled_at, duration_minutes,
      location, meeting_type, agenda: agenda || [], organizer_id: user.id, status: 'scheduled'
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (action === 'add_minutes') {
      const { content, action_items, decisions } = body;

      const { data, error } = await supabase.from('meeting_minutes').insert({
        meeting_id: id, content, action_items: action_items || [],
        decisions: decisions || [], recorded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Update meeting status
      await supabase.from('production_meetings').update({ status: 'completed' }).eq('id', id);

      return NextResponse.json({ minutes: data });
    }

    if (action === 'respond') {
      const { response } = body; // 'accepted', 'declined', 'tentative'
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
