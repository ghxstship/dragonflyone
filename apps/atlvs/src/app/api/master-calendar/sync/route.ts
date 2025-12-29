import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { withAuth, PlatformRole } from '@ghxstship/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SyncRequestSchema = z.object({
  source_type: z.enum([
    'crm_meeting', 'crm_call', 'crm_task', 'crm_reminder', 'crm_deadline',
    'venue_booking', 'venue_hold', 'venue_block', 'venue_maintenance',
    'production_event', 'production_rehearsal', 'production_soundcheck',
    'production_load_in', 'production_load_out', 'production_strike',
    'show_performance', 'show_set_time', 'show_cue', 'run_of_show_entry',
    'project_milestone', 'project_deadline', 'contract_deadline', 'advancing_deadline',
    'crew_shift', 'crew_assignment', 'crew_availability',
    'external_google', 'external_outlook', 'external_apple', 'external_ical',
    'personal', 'holiday', 'other', 'all'
  ]).optional().default('all'),
  force: z.boolean().optional().default(false),
});

async function getAuthenticatedUser(request: NextRequest) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  const { data: platformUser } = await supabase
    .from('platform_users')
    .select('id, organization_id')
    .eq('id', user.id)
    .single();

  return platformUser ? { ...user, ...platformUser } : null;
}

async function syncCrmMeetings(organizationId: string, force: boolean) {
  const syncedCount = { created: 0, updated: 0, skipped: 0 };

  const { data: meetings, error } = await supabase
    .from('calendar_meetings')
    .select('*')
    .eq('organization_id', organizationId);

  if (error || !meetings) {
    logger.error('Error fetching CRM meetings', error);
    return syncedCount;
  }

  for (const meeting of meetings) {
    const { data: existing } = await supabase
      .from('master_calendar_events')
      .select('id, sync_version')
      .eq('source_type', 'crm_meeting')
      .eq('source_id', meeting.id)
      .single();

    if (existing && !force) {
      syncedCount.skipped++;
      continue;
    }

    const eventData = {
      organization_id: organizationId,
      created_by: meeting.user_id,
      title: meeting.title,
      description: meeting.description,
      start_datetime: meeting.start_time,
      end_datetime: meeting.end_time,
      timezone: meeting.timezone || 'America/New_York',
      source_type: 'crm_meeting' as const,
      source_id: meeting.id,
      source_table: 'calendar_meetings',
      status: meeting.status === 'scheduled' ? 'scheduled' as const :
              meeting.status === 'confirmed' ? 'confirmed' as const :
              meeting.status === 'cancelled' ? 'cancelled' as const :
              meeting.status === 'completed' ? 'completed' as const :
              meeting.status === 'no_show' ? 'no_show' as const : 'scheduled' as const,
      location: meeting.location,
      is_virtual: meeting.is_virtual,
      meeting_url: meeting.meeting_url,
      meeting_provider: meeting.meeting_provider,
      contact_id: meeting.contact_id,
      deal_id: meeting.deal_id,
      project_id: meeting.project_id,
      notes: meeting.notes,
    };

    if (existing) {
      await supabase
        .from('master_calendar_events')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      syncedCount.updated++;
    } else {
      await supabase
        .from('master_calendar_events')
        .insert(eventData);
      syncedCount.created++;
    }
  }

  return syncedCount;
}

async function syncBookings(organizationId: string, force: boolean) {
  const syncedCount = { created: 0, updated: 0, skipped: 0 };

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('organization_id', organizationId);

  if (error || !bookings) {
    logger.error('Error fetching bookings', error);
    return syncedCount;
  }

  for (const booking of bookings) {
    const { data: existing } = await supabase
      .from('master_calendar_events')
      .select('id, sync_version')
      .eq('source_type', 'venue_booking')
      .eq('source_id', booking.id)
      .single();

    if (existing && !force) {
      syncedCount.skipped++;
      continue;
    }

    const startDatetime = new Date(`${booking.event_date}T${booking.start_time || '00:00:00'}`);
    const endDatetime = new Date(`${booking.event_date}T${booking.end_time || '23:59:59'}`);

    const eventData = {
      organization_id: organizationId,
      created_by: booking.created_by,
      title: booking.event_name || `Booking #${booking.booking_number}`,
      description: booking.special_requests,
      start_datetime: startDatetime.toISOString(),
      end_datetime: endDatetime.toISOString(),
      all_day: !booking.start_time,
      setup_start: booking.setup_time ? new Date(`${booking.event_date}T${booking.setup_time}`).toISOString() : null,
      breakdown_end: booking.breakdown_time ? new Date(`${booking.event_date}T${booking.breakdown_time}`).toISOString() : null,
      source_type: 'venue_booking' as const,
      source_id: booking.id,
      source_table: 'bookings',
      status: booking.status === 'draft' ? 'draft' as const :
              booking.status === 'pending' ? 'tentative' as const :
              booking.status === 'confirmed' ? 'confirmed' as const :
              booking.status === 'in_progress' ? 'in_progress' as const :
              booking.status === 'completed' ? 'completed' as const :
              booking.status === 'cancelled' ? 'cancelled' as const : 'scheduled' as const,
      venue_id: booking.venue_id,
      booking_id: booking.id,
      contact_id: booking.contact_id,
      guest_count: booking.guest_count_expected || booking.guest_count_guaranteed,
      notes: booking.special_requests,
      internal_notes: booking.internal_notes,
    };

    if (existing) {
      await supabase
        .from('master_calendar_events')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      syncedCount.updated++;
    } else {
      await supabase
        .from('master_calendar_events')
        .insert(eventData);
      syncedCount.created++;
    }
  }

  return syncedCount;
}

async function syncVenueHolds(organizationId: string, force: boolean) {
  const syncedCount = { created: 0, updated: 0, skipped: 0 };

  const { data: holds, error } = await supabase
    .from('space_holds')
    .select('*')
    .eq('organization_id', organizationId);

  if (error || !holds) {
    logger.error('Error fetching space holds', error);
    return syncedCount;
  }

  for (const hold of holds) {
    const { data: existing } = await supabase
      .from('master_calendar_events')
      .select('id, sync_version')
      .eq('source_type', 'venue_hold')
      .eq('source_id', hold.id)
      .single();

    if (existing && !force) {
      syncedCount.skipped++;
      continue;
    }

    const startDatetime = new Date(`${hold.hold_date}T${hold.start_time || '00:00:00'}`);
    const endDatetime = new Date(`${hold.hold_date}T${hold.end_time || '23:59:59'}`);

    const eventData = {
      organization_id: organizationId,
      created_by: hold.created_by,
      title: `Hold: ${hold.notes || 'Space Hold'}`,
      start_datetime: startDatetime.toISOString(),
      end_datetime: endDatetime.toISOString(),
      all_day: !hold.start_time,
      source_type: 'venue_hold' as const,
      source_id: hold.id,
      source_table: 'space_holds',
      status: hold.status === 'active' ? 'tentative' as const :
              hold.status === 'expired' ? 'cancelled' as const :
              hold.status === 'released' ? 'cancelled' as const :
              hold.status === 'converted' ? 'confirmed' as const : 'tentative' as const,
      space_id: hold.space_id,
      contact_id: hold.contact_id,
      notes: hold.notes,
    };

    if (existing) {
      await supabase
        .from('master_calendar_events')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      syncedCount.updated++;
    } else {
      await supabase
        .from('master_calendar_events')
        .insert(eventData);
      syncedCount.created++;
    }
  }

  return syncedCount;
}

async function syncVenueEvents(organizationId: string, force: boolean) {
  const syncedCount = { created: 0, updated: 0, skipped: 0 };

  const { data: venueEvents, error } = await supabase
    .from('venue_events')
    .select('*')
    .eq('organization_id', organizationId);

  if (error || !venueEvents) {
    logger.error('Error fetching venue events', error);
    return syncedCount;
  }

  for (const event of venueEvents) {
    const { data: existing } = await supabase
      .from('master_calendar_events')
      .select('id, sync_version')
      .eq('source_type', 'production_event')
      .eq('source_id', event.id)
      .single();

    if (existing && !force) {
      syncedCount.skipped++;
      continue;
    }

    const eventData = {
      organization_id: organizationId,
      created_by: event.created_by,
      title: event.name,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      all_day: event.all_day,
      setup_start: event.setup_start,
      breakdown_end: event.breakdown_end,
      source_type: 'production_event' as const,
      source_id: event.id,
      source_table: 'venue_events',
      status: event.status === 'tentative' ? 'tentative' as const :
              event.status === 'confirmed' ? 'confirmed' as const :
              event.status === 'cancelled' ? 'cancelled' as const : 'scheduled' as const,
      venue_id: event.venue_id,
      space_id: event.space_id,
      booking_id: event.booking_id,
      contact_id: event.contact_id,
      notes: event.notes,
      internal_notes: event.internal_notes,
      color: event.color,
    };

    if (existing) {
      await supabase
        .from('master_calendar_events')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      syncedCount.updated++;
    } else {
      await supabase
        .from('master_calendar_events')
        .insert(eventData);
      syncedCount.created++;
    }
  }

  return syncedCount;
}

async function syncCrmTasks(organizationId: string, force: boolean) {
  const syncedCount = { created: 0, updated: 0, skipped: 0 };

  const { data: tasks, error } = await supabase
    .from('crm_tasks')
    .select('*')
    .not('due_date', 'is', null);

  if (error || !tasks) {
    logger.error('Error fetching CRM tasks', error);
    return syncedCount;
  }

  // Filter by organization through user
  const filteredTasks = [];
  for (const task of tasks) {
    const { data: user } = await supabase
      .from('platform_users')
      .select('organization_id')
      .eq('id', task.user_id)
      .single();
    
    if (user?.organization_id === organizationId) {
      filteredTasks.push(task);
    }
  }

  for (const task of filteredTasks) {
    const sourceType = task.task_type === 'call' ? 'crm_call' :
                       task.task_type === 'meeting' ? 'crm_meeting' :
                       task.task_type === 'deadline' ? 'crm_deadline' : 'crm_task';

    const { data: existing } = await supabase
      .from('master_calendar_events')
      .select('id, sync_version')
      .in('source_type', ['crm_task', 'crm_call', 'crm_meeting', 'crm_deadline'])
      .eq('source_id', task.id)
      .single();

    if (existing && !force) {
      syncedCount.skipped++;
      continue;
    }

    const dueDate = new Date(task.due_date);
    const endDate = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const eventData = {
      organization_id: organizationId,
      created_by: task.user_id,
      assigned_to: task.assigned_to,
      title: task.title,
      description: task.description,
      start_datetime: dueDate.toISOString(),
      end_datetime: endDate.toISOString(),
      all_day: true,
      source_type: sourceType as 'crm_task' | 'crm_call' | 'crm_meeting' | 'crm_deadline',
      source_id: task.id,
      source_table: 'crm_tasks',
      status: task.status === 'pending' ? 'scheduled' as const :
              task.status === 'in_progress' ? 'in_progress' as const :
              task.status === 'completed' ? 'completed' as const :
              task.status === 'cancelled' ? 'cancelled' as const :
              task.status === 'deferred' ? 'tentative' as const : 'scheduled' as const,
      contact_id: task.contact_id,
      deal_id: task.deal_id,
      project_id: task.project_id,
      priority: task.priority,
    };

    if (existing) {
      await supabase
        .from('master_calendar_events')
        .update({ ...eventData, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      syncedCount.updated++;
    } else {
      await supabase
        .from('master_calendar_events')
        .insert(eventData);
      syncedCount.created++;
    }
  }

  return syncedCount;
}

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

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { source_type, force } = SyncRequestSchema.parse(body);

    const results: Record<string, { created: number; updated: number; skipped: number }> = {};

    if (source_type === 'all' || source_type === 'crm_meeting') {
      results.crm_meetings = await syncCrmMeetings(user.organization_id, force);
    }

    if (source_type === 'all' || source_type === 'venue_booking') {
      results.bookings = await syncBookings(user.organization_id, force);
    }

    if (source_type === 'all' || source_type === 'venue_hold') {
      results.holds = await syncVenueHolds(user.organization_id, force);
    }

    if (source_type === 'all' || source_type === 'production_event') {
      results.venue_events = await syncVenueEvents(user.organization_id, force);
    }

    if (source_type === 'all' || source_type === 'crm_task') {
      results.crm_tasks = await syncCrmTasks(user.organization_id, force);
    }

    // Calculate totals
    const totals = Object.values(results).reduce(
      (acc, curr) => ({
        created: acc.created + curr.created,
        updated: acc.updated + curr.updated,
        skipped: acc.skipped + curr.skipped,
      }),
      { created: 0, updated: 0, skipped: 0 }
    );

    // Log sync operation
    await supabase.from('calendar_sync_log').insert({
      action: 'sync',
      direction: 'source_to_master',
      changes: { source_type, results, totals },
      status: 'success',
      performed_by: user.id,
    });

    return NextResponse.json({
      success: true,
      results,
      totals,
      message: `Synced ${totals.created} new events, updated ${totals.updated}, skipped ${totals.skipped}`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/master-calendar/sync', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get sync status and recent sync logs
    const { data: recentSyncs } = await supabase
      .from('calendar_sync_log')
      .select('*')
      .eq('performed_by', user.id)
      .eq('action', 'sync')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get counts by source type
    const { data: sourceCounts } = await supabase
      .from('master_calendar_events')
      .select('source_type')
      .eq('organization_id', user.organization_id)
      .is('deleted_at', null);

    const countsBySource: Record<string, number> = {};
    if (sourceCounts) {
      for (const event of sourceCounts) {
        countsBySource[event.source_type] = (countsBySource[event.source_type] || 0) + 1;
      }
    }

    return NextResponse.json({
      recent_syncs: recentSyncs || [],
      counts_by_source: countsBySource,
      total_events: sourceCounts?.length || 0,
    });
  } catch (error) {
    logger.error('Error in GET /api/master-calendar/sync', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
