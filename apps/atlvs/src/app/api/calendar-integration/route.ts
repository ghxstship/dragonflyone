import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CalendarAccountSchema = z.object({
  provider: z.enum(['google', 'outlook', 'apple', 'caldav']),
  email_address: z.string().email(),
  calendar_name: z.string().optional(),
  sync_direction: z.enum(['one_way', 'two_way']).default('two_way'),
  default_reminder_minutes: z.number().int().default(30),
});

const MeetingSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  timezone: z.string().default('America/New_York'),
  location: z.string().optional(),
  is_virtual: z.boolean().default(false),
  meeting_url: z.string().url().optional(),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    response_status: z.enum(['pending', 'accepted', 'declined', 'tentative']).default('pending'),
  })),
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  reminder_minutes: z.number().int().optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().int().default(1),
    until: z.string().optional(),
    count: z.number().int().optional(),
  }).optional(),
});

// GET /api/calendar-integration - Get calendar accounts and meetings
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
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const projectId = searchParams.get('project_id');

    // Get connected calendar accounts
    const { data: accounts } = await supabase
      .from('calendar_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Get meetings
    let query = supabase
      .from('calendar_meetings')
      .select(`
        *,
        attendees:meeting_attendees(*),
        contact:contacts(id, first_name, last_name, email),
        deal:deals(id, name),
        project:projects(id, name)
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (startDate) {
      query = query.gte('start_time', startDate);
    }

    if (endDate) {
      query = query.lte('end_time', endDate);
    }

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: meetings, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get available time slots for scheduling
    const { data: availability } = await supabase
      .from('user_availability')
      .select('*')
      .eq('user_id', user.id);

    return NextResponse.json({
      accounts: accounts || [],
      meetings: meetings || [],
      availability: availability || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

// POST /api/calendar-integration - Connect account or create meeting
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
    const action = body.action || 'create_meeting';

    if (action === 'connect_account') {
      const validated = CalendarAccountSchema.parse(body);

      const { data: account, error } = await supabase
        .from('calendar_accounts')
        .insert({
          user_id: user.id,
          provider: validated.provider,
          email_address: validated.email_address,
          calendar_name: validated.calendar_name,
          sync_direction: validated.sync_direction,
          default_reminder_minutes: validated.default_reminder_minutes,
          is_active: true,
          connected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        account,
        oauth_url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/calendar-integration/callback&response_type=code&scope=https://www.googleapis.com/auth/calendar`,
      }, { status: 201 });
    } else if (action === 'create_meeting') {
      const validated = MeetingSchema.parse(body);

      // Create meeting
      const { data: meeting, error } = await supabase
        .from('calendar_meetings')
        .insert({
          user_id: user.id,
          title: validated.title,
          description: validated.description,
          start_time: validated.start_time,
          end_time: validated.end_time,
          timezone: validated.timezone,
          location: validated.location,
          is_virtual: validated.is_virtual,
          meeting_url: validated.meeting_url,
          contact_id: validated.contact_id,
          deal_id: validated.deal_id,
          project_id: validated.project_id,
          reminder_minutes: validated.reminder_minutes,
          recurrence: validated.recurrence,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add attendees
      if (validated.attendees.length > 0) {
        await supabase.from('meeting_attendees').insert(
          validated.attendees.map(a => ({
            meeting_id: meeting.id,
            email: a.email,
            name: a.name,
            response_status: a.response_status,
          }))
        );
      }

      // Send invitations (in production, this would send actual calendar invites)
      // For now, create notification
      for (const attendee of validated.attendees) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'event_reminder',
          title: 'Meeting Invitation',
          message: `You've been invited to: ${validated.title}`,
          link: `/calendar/meetings/${meeting.id}`,
        });
      }

      return NextResponse.json({ meeting }, { status: 201 });
    } else if (action === 'find_available_slots') {
      const { attendee_emails, duration_minutes, date_range_start, date_range_end } = body;

      // In production, this would check availability across all attendees' calendars
      // For now, return mock available slots
      const slots = [];
      const start = new Date(date_range_start);
      const end = new Date(date_range_end);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        // Add morning and afternoon slots
        slots.push({
          start: new Date(d.setHours(9, 0, 0, 0)).toISOString(),
          end: new Date(d.setHours(9 + Math.floor(duration_minutes / 60), duration_minutes % 60, 0, 0)).toISOString(),
        });
        slots.push({
          start: new Date(d.setHours(14, 0, 0, 0)).toISOString(),
          end: new Date(d.setHours(14 + Math.floor(duration_minutes / 60), duration_minutes % 60, 0, 0)).toISOString(),
        });
      }

      return NextResponse.json({ available_slots: slots.slice(0, 10) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/calendar-integration - Update meeting
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

    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meeting_id');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: meeting, error } = await supabase
      .from('calendar_meetings')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 });
  }
}

// DELETE /api/calendar-integration - Cancel meeting or disconnect account
export async function DELETE(request: NextRequest) {
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
    const meetingId = searchParams.get('meeting_id');
    const accountId = searchParams.get('account_id');

    if (meetingId) {
      const { error } = await supabase
        .from('calendar_meetings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', meetingId)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Meeting cancelled' });
    } else if (accountId) {
      const { error } = await supabase
        .from('calendar_accounts')
        .update({ 
          is_active: false,
          disconnected_at: new Date().toISOString(),
        })
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Calendar disconnected' });
    }

    return NextResponse.json({ error: 'Meeting ID or Account ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
