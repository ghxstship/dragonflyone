import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().optional(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  all_day: z.boolean().optional(),
  venue_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const eventId = params.id;

    const { data: event, error } = await supabase
      .from('calendar_events')
      .select(`
        id,
        title,
        event_type,
        date,
        start_time,
        end_time,
        all_day,
        venue_id,
        venue:venues(id, name),
        description,
        color,
        is_recurring,
        recurring_config,
        parent_event_id,
        created_at,
        updated_at
      `)
      .eq('id', eventId)
      .single();

    if (error || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get associated spaces
    const { data: spaces } = await supabase
      .from('calendar_event_spaces')
      .select('space:spaces(id, name, capacity)')
      .eq('calendar_event_id', eventId);

    return NextResponse.json({
      event,
      spaces: spaces?.map(s => s.space) || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const eventId = params.id;

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Check if event exists
    const { data: existing, error: existingError } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const { data: event, error } = await supabase
      .from('calendar_events')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const eventId = params.id;
    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get('delete_all') === 'true';

    // Get the event to check if it's recurring
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .select('id, is_recurring, parent_event_id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // If deleting all occurrences of a recurring event
    if (deleteAll && (event.is_recurring || event.parent_event_id)) {
      const parentId = event.parent_event_id || event.id;
      
      // Delete all occurrences
      await supabase
        .from('calendar_events')
        .delete()
        .eq('parent_event_id', parentId);
      
      // Delete parent
      await supabase
        .from('calendar_events')
        .delete()
        .eq('id', parentId);

      return NextResponse.json({
        success: true,
        message: 'All occurrences deleted',
      });
    }

    // Delete single event
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
