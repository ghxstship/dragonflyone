import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { withAuth, PlatformRole } from '@ghxstship/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Zod schemas for validation
const CalendarSourceTypeSchema = z.enum([
  'crm_meeting', 'crm_call', 'crm_task', 'crm_reminder', 'crm_deadline',
  'venue_booking', 'venue_hold', 'venue_block', 'venue_maintenance',
  'production_event', 'production_rehearsal', 'production_soundcheck',
  'production_load_in', 'production_load_out', 'production_strike',
  'show_performance', 'show_set_time', 'show_cue', 'run_of_show_entry',
  'project_milestone', 'project_deadline', 'contract_deadline', 'advancing_deadline',
  'crew_shift', 'crew_assignment', 'crew_availability',
  'external_google', 'external_outlook', 'external_apple', 'external_ical',
  'personal', 'holiday', 'other'
]);

const CalendarEventStatusSchema = z.enum([
  'draft', 'tentative', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
]);

const CalendarVisibilitySchema = z.enum(['public', 'organization', 'team', 'private']);

const UpdateEventSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  start_datetime: z.string().datetime().optional(),
  end_datetime: z.string().datetime().optional(),
  all_day: z.boolean().optional(),
  timezone: z.string().optional(),
  setup_start: z.string().datetime().nullable().optional(),
  breakdown_end: z.string().datetime().nullable().optional(),
  source_type: CalendarSourceTypeSchema.optional(),
  source_id: z.string().uuid().nullable().optional(),
  source_table: z.string().nullable().optional(),
  status: CalendarEventStatusSchema.optional(),
  visibility: CalendarVisibilitySchema.optional(),
  location: z.string().nullable().optional(),
  venue_id: z.string().uuid().nullable().optional(),
  space_id: z.string().uuid().nullable().optional(),
  is_virtual: z.boolean().optional(),
  meeting_url: z.string().url().nullable().optional(),
  meeting_provider: z.string().nullable().optional(),
  event_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  production_id: z.string().uuid().nullable().optional(),
  contact_id: z.string().uuid().nullable().optional(),
  deal_id: z.string().uuid().nullable().optional(),
  booking_id: z.string().uuid().nullable().optional(),
  attendees: z.array(z.object({
    user_id: z.string().uuid().optional(),
    email: z.string().email(),
    name: z.string().optional(),
    response_status: z.enum(['pending', 'accepted', 'declined', 'tentative']).optional()
  })).optional(),
  guest_count: z.number().int().positive().nullable().optional(),
  department: z.string().nullable().optional(),
  responsible: z.string().nullable().optional(),
  artist_id: z.string().uuid().nullable().optional(),
  artist_name: z.string().nullable().optional(),
  stage: z.string().nullable().optional(),
  is_recurring: z.boolean().optional(),
  recurrence_rule: z.string().nullable().optional(),
  reminder_minutes: z.array(z.number().int()).nullable().optional(),
  color: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes: z.string().nullable().optional(),
  internal_notes: z.string().nullable().optional(),
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

  // Get user's organization and roles
  const { data: platformUser } = await supabase
    .from('platform_users')
    .select('id, organization_id')
    .eq('id', user.id)
    .single();

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const roles = userRoles?.map(r => r.role) || [];
  const isAdmin = roles.some(r => 
    r.includes('SUPER_ADMIN') || r.includes('ADMIN') || r.includes('LEGEND')
  );

  return platformUser ? { ...user, ...platformUser, roles, isAdmin } : null;
}

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const { data, error } = await supabase
      .from('master_calendar_events')
      .select(`
        *,
        venue:venues(id, name, address, city),
        space:venue_spaces(id, name, capacity),
        project:projects(id, name, status),
        production:productions(id, name),
        contact:contacts(id, first_name, last_name, email, phone),
        deal:deals(id, name, value),
        booking:bookings(id, booking_number, status),
        creator:platform_users!created_by(id, email),
        assignee:platform_users!assigned_to(id, email),
        artist:artists(id, name)
      `)
      .eq('id', id)
      .eq('organization_id', user.organization_id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 });
      }
      logger.error('Error fetching calendar event', error);
      return NextResponse.json({ error: 'Failed to fetch calendar event' }, { status: 500 });
    }

    // Get linked source events
    const { data: links } = await supabase
      .from('calendar_event_links')
      .select('*')
      .eq('master_event_id', id);

    // Get sync history
    const { data: syncHistory } = await supabase
      .from('calendar_sync_log')
      .select('*')
      .eq('master_event_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      data: {
        ...data,
        links: links || [],
        sync_history: syncHistory || []
      }
    });
  } catch (error) {
    logger.error('Error in GET /api/master-calendar/[id]', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const validatedData = UpdateEventSchema.parse(body);

    // Check if event exists and user has permission
    const { data: existingEvent, error: fetchError } = await supabase
      .from('master_calendar_events')
      .select('*')
      .eq('id', id)
      .eq('organization_id', user.organization_id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 });
    }

    // Check permission: owner, assignee, or admin
    const canEdit = 
      existingEvent.created_by === user.id ||
      existingEvent.assigned_to === user.id ||
      user.isAdmin ||
      existingEvent.visibility !== 'private';

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate datetime range if both are provided
    const startDatetime = validatedData.start_datetime || existingEvent.start_datetime;
    const endDatetime = validatedData.end_datetime || existingEvent.end_datetime;
    
    if (new Date(endDatetime) < new Date(startDatetime)) {
      return NextResponse.json({ error: 'End datetime must be after start datetime' }, { status: 400 });
    }

    // Check for conflicts if venue/space is being changed or dates are changing
    const venueId = validatedData.venue_id !== undefined ? validatedData.venue_id : existingEvent.venue_id;
    const spaceId = validatedData.space_id !== undefined ? validatedData.space_id : existingEvent.space_id;
    
    if (venueId || spaceId) {
      const { data: conflicts } = await supabase.rpc('check_calendar_conflicts', {
        p_organization_id: user.organization_id,
        p_start_datetime: startDatetime,
        p_end_datetime: endDatetime,
        p_venue_id: venueId || null,
        p_space_id: spaceId || null,
        p_exclude_event_id: id
      });

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json({
          error: 'Calendar conflict detected',
          conflicts
        }, { status: 409 });
      }
    }

    const { data, error } = await supabase
      .from('master_calendar_events')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating calendar event', error);
      return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PATCH /api/master-calendar/[id]', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // Check if event exists and user has permission
    const { data: existingEvent, error: fetchError } = await supabase
      .from('master_calendar_events')
      .select('*')
      .eq('id', id)
      .eq('organization_id', user.organization_id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 });
    }

    // Check permission: owner or admin only for delete
    const canDelete = existingEvent.created_by === user.id || user.isAdmin;

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (hardDelete && user.isAdmin) {
      // Hard delete - remove from database entirely
      const { error } = await supabase
        .from('master_calendar_events')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error hard deleting calendar event', error);
        return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
      }
    } else {
      // Soft delete - set deleted_at timestamp
      const { error } = await supabase
        .from('master_calendar_events')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        logger.error('Error soft deleting calendar event', error);
        return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error in DELETE /api/master-calendar/[id]', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
