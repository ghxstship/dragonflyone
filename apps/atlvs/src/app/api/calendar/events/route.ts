import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(1),
  event_type: z.enum(['booking', 'internal', 'blocked', 'maintenance', 'holiday']),
  date: z.string(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  all_day: z.boolean().default(false),
  venue_id: z.string().uuid().optional(),
  space_ids: z.array(z.string().uuid()).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  recurring: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).default(1),
    end_date: z.string().optional(),
    days_of_week: z.array(z.number().min(0).max(6)).optional(),
  }).optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Create calendar event
    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert({
        title: validatedData.title,
        event_type: validatedData.event_type,
        date: validatedData.date,
        start_time: validatedData.start_time || null,
        end_time: validatedData.end_time || null,
        all_day: validatedData.all_day,
        venue_id: validatedData.venue_id || null,
        description: validatedData.description || null,
        color: validatedData.color || null,
        recurring_config: validatedData.recurring || null,
        is_recurring: !!validatedData.recurring,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    // Associate spaces if provided
    if (validatedData.space_ids && validatedData.space_ids.length > 0) {
      const spaceAssociations = validatedData.space_ids.map(spaceId => ({
        calendar_event_id: event.id,
        space_id: spaceId,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('calendar_event_spaces').insert(spaceAssociations);
    }

    // If recurring, generate occurrences
    if (validatedData.recurring) {
      const occurrences = generateRecurringDates(
        validatedData.date,
        validatedData.recurring
      );

      if (occurrences.length > 0) {
        const occurrenceRecords = occurrences.map(date => ({
          parent_event_id: event.id,
          date,
          title: validatedData.title,
          event_type: validatedData.event_type,
          start_time: validatedData.start_time || null,
          end_time: validatedData.end_time || null,
          all_day: validatedData.all_day,
          venue_id: validatedData.venue_id || null,
          color: validatedData.color || null,
          is_occurrence: true,
          created_at: new Date().toISOString(),
        }));

        await supabase.from('calendar_events').insert(occurrenceRecords);
      }
    }

    return NextResponse.json({
      success: true,
      event,
    }, { status: 201 });
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

function generateRecurringDates(
  startDate: string,
  recurring: {
    frequency: string;
    interval: number;
    end_date?: string;
    days_of_week?: number[];
  }
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = recurring.end_date 
    ? new Date(recurring.end_date) 
    : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

  const maxOccurrences = 52; // Limit to 52 occurrences
  const current = new Date(start);
  current.setDate(current.getDate() + recurring.interval); // Skip first date (already created)

  while (current <= end && dates.length < maxOccurrences) {
    if (recurring.frequency === 'weekly' && recurring.days_of_week) {
      if (recurring.days_of_week.includes(current.getDay())) {
        dates.push(current.toISOString().split('T')[0]);
      }
    } else {
      dates.push(current.toISOString().split('T')[0]);
    }

    switch (recurring.frequency) {
      case 'daily':
        current.setDate(current.getDate() + recurring.interval);
        break;
      case 'weekly':
        current.setDate(current.getDate() + (7 * recurring.interval));
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + recurring.interval);
        break;
      case 'yearly':
        current.setFullYear(current.getFullYear() + recurring.interval);
        break;
    }
  }

  return dates;
}
