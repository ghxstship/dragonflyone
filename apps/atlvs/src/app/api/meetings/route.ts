import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch meetings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'board', 'executive', 'team', 'all'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('meetings')
      .select(`
        *,
        organizer:platform_users!organizer_id(id, email, first_name, last_name),
        attendees:meeting_attendees(
          user:platform_users(id, email, first_name, last_name),
          status,
          role
        ),
        minutes:meeting_minutes(*)
      `);

    if (type && type !== 'all') {
      query = query.eq('meeting_type', type);
    }

    if (startDate) {
      query = query.gte('scheduled_at', startDate);
    }

    if (endDate) {
      query = query.lte('scheduled_at', endDate);
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meetings: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

// POST - Create meeting
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      meeting_type, // 'board', 'executive', 'team', 'client', 'vendor'
      scheduled_at,
      duration_minutes,
      location,
      virtual_link,
      attendee_ids,
      agenda_items,
      recurring,
      recurring_pattern,
    } = body;

    // Create meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title,
        description,
        meeting_type,
        scheduled_at,
        duration_minutes: duration_minutes || 60,
        location,
        virtual_link,
        organizer_id: user.id,
        status: 'scheduled',
        recurring: recurring || false,
        recurring_pattern,
      })
      .select()
      .single();

    if (meetingError) {
      return NextResponse.json({ error: meetingError.message }, { status: 500 });
    }

    // Add attendees
    if (attendee_ids && attendee_ids.length > 0) {
      const attendeeRecords = attendee_ids.map((id: string) => ({
        meeting_id: meeting.id,
        user_id: id,
        status: 'pending',
        role: 'attendee',
      }));

      await supabase.from('meeting_attendees').insert(attendeeRecords);
    }

    // Add agenda items
    if (agenda_items && agenda_items.length > 0) {
      const agendaRecords = agenda_items.map((item: any, index: number) => ({
        meeting_id: meeting.id,
        title: item.title,
        description: item.description,
        duration_minutes: item.duration_minutes,
        presenter_id: item.presenter_id,
        order_index: index,
      }));

      await supabase.from('meeting_agenda_items').insert(agendaRecords);
    }

    // Send invitations
    // TODO: Integrate with email service

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}

// PATCH - Update meeting or add minutes
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { meeting_id, action, ...updateData } = body;

    if (action === 'add_minutes') {
      const { content, action_items, decisions, next_steps } = updateData;

      const { data: minutes, error } = await supabase
        .from('meeting_minutes')
        .insert({
          meeting_id,
          content,
          action_items: action_items || [],
          decisions: decisions || [],
          next_steps: next_steps || [],
          recorded_by: user.id,
          approved: false,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update meeting status
      await supabase
        .from('meetings')
        .update({ status: 'completed', has_minutes: true })
        .eq('id', meeting_id);

      return NextResponse.json({ minutes });
    }

    if (action === 'approve_minutes') {
      const { minutes_id } = updateData;

      await supabase
        .from('meeting_minutes')
        .update({
          approved: true,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', minutes_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'respond') {
      const { response } = updateData; // 'accepted', 'declined', 'tentative'

      await supabase
        .from('meeting_attendees')
        .update({ status: response, responded_at: new Date().toISOString() })
        .eq('meeting_id', meeting_id)
        .eq('user_id', user.id);

      return NextResponse.json({ success: true });
    }

    // Default: update meeting details
    const { error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', meeting_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}
