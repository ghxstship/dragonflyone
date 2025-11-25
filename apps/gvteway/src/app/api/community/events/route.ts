import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const communityEventSchema = z.object({
  group_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  venue_id: z.string().uuid().optional(),
  event_date: z.string(),
  end_date: z.string().optional(),
  max_attendees: z.number().int().positive().optional(),
  event_type: z.enum(['meetup', 'watch_party', 'pre_party', 'after_party', 'discussion', 'workshop', 'other']).default('meetup'),
  is_virtual: z.boolean().default(false),
  virtual_link: z.string().url().optional(),
  cover_image: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/community/events - List community events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('group_id');
    const status = searchParams.get('status');
    const eventType = searchParams.get('event_type');
    const upcoming = searchParams.get('upcoming') === 'true';
    const organizerId = searchParams.get('organizer_id');

    let query = supabase
      .from('community_events')
      .select(`
        *,
        group:community_groups(id, name, slug),
        organizer:platform_users!organizer_id(id, full_name, avatar_url),
        venue:venues(id, name, location),
        rsvps:community_event_rsvps(
          id,
          user_id,
          status,
          user:platform_users(id, full_name, avatar_url)
        )
      `)
      .order('event_date', { ascending: true });

    if (groupId) {
      query = query.eq('group_id', groupId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    if (upcoming) {
      query = query.gte('event_date', new Date().toISOString());
    }
    if (organizerId) {
      query = query.eq('organizer_id', organizerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching community events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch community events', details: error.message },
        { status: 500 }
      );
    }

    interface EventRecord {
      id: string;
      status: string;
      event_type: string;
      attendees_count: number;
      event_date: string;
      [key: string]: unknown;
    }
    const events = (data || []) as unknown as EventRecord[];

    const now = new Date();
    const summary = {
      total: events.length,
      by_status: {
        upcoming: events.filter(e => e.status === 'upcoming').length,
        ongoing: events.filter(e => e.status === 'ongoing').length,
        completed: events.filter(e => e.status === 'completed').length,
        cancelled: events.filter(e => e.status === 'cancelled').length,
      },
      by_type: events.reduce((acc, e) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_attendees: events.reduce((sum, e) => sum + (e.attendees_count || 0), 0),
      this_week: events.filter(e => {
        const eventDate = new Date(e.event_date);
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= weekFromNow;
      }).length,
    };

    return NextResponse.json({ events: data, summary });
  } catch (error) {
    console.error('Error in GET /api/community/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/community/events - Create community event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = communityEventSchema.parse(body);

    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: event, error } = await supabase
      .from('community_events')
      .insert({
        ...validated,
        organizer_id: userId,
        status: 'upcoming',
        attendees_count: 0,
      })
      .select(`
        *,
        group:community_groups(id, name),
        organizer:platform_users!organizer_id(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating community event:', error);
      return NextResponse.json(
        { error: 'Failed to create community event', details: error.message },
        { status: 500 }
      );
    }

    // Auto-RSVP the organizer as going
    await supabase.from('community_event_rsvps').insert({
      event_id: event.id,
      user_id: userId,
      status: 'going',
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/community/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/community/events - Update event or RSVP
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    if (action === 'rsvp') {
      const rsvpStatus = updates?.status;
      if (!['going', 'interested', 'not_going'].includes(rsvpStatus)) {
        return NextResponse.json({ error: 'Invalid RSVP status' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('community_event_rsvps')
        .upsert({
          event_id,
          user_id: userId,
          status: rsvpStatus,
          guests_count: updates?.guests_count || 0,
          notes: updates?.notes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'event_id,user_id',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update RSVP', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, rsvp: data });
    }

    if (action === 'cancel') {
      const { data, error } = await supabase
        .from('community_events')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', event_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to cancel event', details: error.message },
          { status: 500 }
        );
      }

      // Notify attendees
      const { data: rsvps } = await supabase
        .from('community_event_rsvps')
        .select('user_id')
        .eq('event_id', event_id)
        .eq('status', 'going');

      if (rsvps && rsvps.length > 0) {
        await supabase.from('notifications').insert(
          rsvps.map(r => ({
            user_id: r.user_id,
            type: 'event_cancelled',
            title: 'Event Cancelled',
            message: `An event you were attending has been cancelled`,
            data: { event_id },
          }))
        );
      }

      return NextResponse.json({ success: true, event: data });
    }

    // Regular update
    if (updates) {
      const { data, error } = await supabase
        .from('community_events')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', event_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update event', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, event: data });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/community/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
