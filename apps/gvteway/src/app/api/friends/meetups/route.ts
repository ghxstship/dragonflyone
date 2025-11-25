import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Get meetups where user is organizer or attendee
    const { data, error } = await supabase
      .from('friend_meetups')
      .select(`
        *,
        event:events(id, title, date),
        organizer:platform_users!friend_meetups_organizer_id_fkey(id, first_name, last_name)
      `)
      .or(`organizer_id.eq.${user.id},attendees.cs.{${user.id}}`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const meetups = data?.map(m => ({
      id: m.id,
      event_id: m.event_id,
      event_name: (m.event as any)?.title,
      event_date: (m.event as any)?.date,
      organizer_id: m.organizer_id,
      organizer_name: m.organizer ? `${(m.organizer as any).first_name} ${(m.organizer as any).last_name}` : 'Unknown',
      location: m.location,
      time: m.time,
      attendees: m.attendees || [],
      status: m.status,
    })) || [];

    return NextResponse.json({ meetups });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { event_id, location, time, invitees } = body;

    if (!location || !time) {
      return NextResponse.json(
        { error: 'Location and time are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('friend_meetups')
      .insert({
        event_id,
        organizer_id: user.id,
        location,
        time,
        attendees: [user.id], // Organizer is automatically attending
        invitees: invitees || [],
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Send notifications to invitees

    return NextResponse.json({ meetup: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { meetup_id, action } = body;

    if (!meetup_id) {
      return NextResponse.json({ error: 'Meetup ID required' }, { status: 400 });
    }

    if (action === 'confirm') {
      // Add user to attendees
      const { data: meetup } = await supabase
        .from('friend_meetups')
        .select('attendees')
        .eq('id', meetup_id)
        .single();

      const attendees = meetup?.attendees || [];
      if (!attendees.includes(user.id)) {
        attendees.push(user.id);
      }

      const { error } = await supabase
        .from('friend_meetups')
        .update({ attendees, status: 'confirmed' })
        .eq('id', meetup_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'cancel') {
      const { error } = await supabase
        .from('friend_meetups')
        .update({ status: 'cancelled' })
        .eq('id', meetup_id)
        .eq('organizer_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
