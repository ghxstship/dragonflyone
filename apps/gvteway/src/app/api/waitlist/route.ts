import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const joinWaitlistSchema = z.object({
  event_id: z.string().uuid(),
  ticket_type_id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  quantity: z.number().int().min(1).max(10).default(1),
  notes: z.string().optional(),
});

// GET /api/waitlist - Get waitlist entries for an event
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    if (!eventId && !email) {
      return NextResponse.json(
        { error: 'event_id or email is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('event_waitlist')
      .select(`
        *,
        events (
          id,
          name,
          start_date,
          venue_id
        ),
        ticket_types (
          id,
          name,
          price
        )
      `)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (email) {
      query = query.eq('email', email);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate position for each entry
    const entriesWithPosition = data?.map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));

    // Get summary stats
    const summary = {
      total: data?.length || 0,
      waiting: data?.filter(e => e.status === 'waiting').length || 0,
      notified: data?.filter(e => e.status === 'notified').length || 0,
      converted: data?.filter(e => e.status === 'converted').length || 0,
    };

    return NextResponse.json({
      waitlist: entriesWithPosition,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/waitlist - Join waitlist
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = joinWaitlistSchema.parse(body);

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, status')
      .eq('id', validated.event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('event_waitlist')
      .select('id')
      .eq('event_id', validated.event_id)
      .eq('email', validated.email)
      .eq('ticket_type_id', validated.ticket_type_id || null)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already on waitlist for this event' },
        { status: 409 }
      );
    }

    // Get current position
    const { count } = await supabase
      .from('event_waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', validated.event_id)
      .eq('status', 'waiting');

    // Add to waitlist
    const { data: entry, error: insertError } = await supabase
      .from('event_waitlist')
      .insert({
        ...validated,
        status: 'waiting',
        priority: 0,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entry,
      position: (count || 0) + 1,
      message: `You are #${(count || 0) + 1} on the waitlist`,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/waitlist - Leave waitlist
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const email = searchParams.get('email');
    const eventId = searchParams.get('event_id');

    if (!entryId && (!email || !eventId)) {
      return NextResponse.json(
        { error: 'id or (email and event_id) is required' },
        { status: 400 }
      );
    }

    let query = supabase.from('event_waitlist').delete();

    if (entryId) {
      query = query.eq('id', entryId);
    } else {
      query = query.eq('email', email!).eq('event_id', eventId!);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from waitlist',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/waitlist - Update waitlist entry (admin)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, status, priority, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (notes !== undefined) updates.notes = notes;

    if (status === 'notified') {
      updates.notified_at = new Date().toISOString();
      updates.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (status === 'converted') {
      updates.converted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('event_waitlist')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      entry: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
