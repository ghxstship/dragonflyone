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

const CreateEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_datetime: z.string().datetime(),
  end_datetime: z.string().datetime(),
  all_day: z.boolean().optional().default(false),
  timezone: z.string().optional().default('America/New_York'),
  setup_start: z.string().datetime().optional(),
  breakdown_end: z.string().datetime().optional(),
  source_type: CalendarSourceTypeSchema.optional().default('other'),
  source_id: z.string().uuid().optional(),
  source_table: z.string().optional(),
  status: CalendarEventStatusSchema.optional().default('scheduled'),
  visibility: CalendarVisibilitySchema.optional().default('organization'),
  location: z.string().optional(),
  venue_id: z.string().uuid().optional(),
  space_id: z.string().uuid().optional(),
  is_virtual: z.boolean().optional().default(false),
  meeting_url: z.string().url().optional(),
  meeting_provider: z.string().optional(),
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  production_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
  attendees: z.array(z.object({
    user_id: z.string().uuid().optional(),
    email: z.string().email(),
    name: z.string().optional(),
    response_status: z.enum(['pending', 'accepted', 'declined', 'tentative']).optional()
  })).optional(),
  guest_count: z.number().int().positive().optional(),
  department: z.string().optional(),
  responsible: z.string().optional(),
  artist_id: z.string().uuid().optional(),
  artist_name: z.string().optional(),
  stage: z.string().optional(),
  is_recurring: z.boolean().optional().default(false),
  recurrence_rule: z.string().optional(),
  reminder_minutes: z.array(z.number().int()).optional(),
  color: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
});

const QueryParamsSchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  source_types: z.string().optional(), // Comma-separated list
  venue_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  production_id: z.string().uuid().optional(),
  status: z.string().optional(), // Comma-separated list
  visibility: CalendarVisibilitySchema.optional(),
  assigned_to: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
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

  // Get user's organization
  const { data: platformUser } = await supabase
    .from('platform_users')
    .select('id, organization_id')
    .eq('id', user.id)
    .single();

  return platformUser ? { ...user, ...platformUser } : null;
}

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

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

    const { searchParams } = new URL(request.url);
    const params = QueryParamsSchema.parse(Object.fromEntries(searchParams));

    let query = supabase
      .from('master_calendar_events')
      .select(`
        *,
        venue:venues(id, name),
        space:venue_spaces(id, name),
        project:projects(id, name),
        production:productions(id, name),
        contact:contacts(id, first_name, last_name, email),
        creator:platform_users!created_by(id, email),
        assignee:platform_users!assigned_to(id, email)
      `)
      .eq('organization_id', user.organization_id)
      .is('deleted_at', null)
      .order('start_datetime', { ascending: true })
      .range(params.offset, params.offset + params.limit - 1);

    // Apply date range filter
    if (params.start_date) {
      query = query.gte('end_datetime', params.start_date);
    }
    if (params.end_date) {
      query = query.lte('start_datetime', params.end_date);
    }

    // Apply source type filter
    if (params.source_types) {
      const types = params.source_types.split(',');
      query = query.in('source_type', types);
    }

    // Apply venue filter
    if (params.venue_id) {
      query = query.eq('venue_id', params.venue_id);
    }

    // Apply project filter
    if (params.project_id) {
      query = query.eq('project_id', params.project_id);
    }

    // Apply production filter
    if (params.production_id) {
      query = query.eq('production_id', params.production_id);
    }

    // Apply status filter
    if (params.status) {
      const statuses = params.status.split(',');
      query = query.in('status', statuses);
    }

    // Apply visibility filter
    if (params.visibility) {
      query = query.eq('visibility', params.visibility);
    }

    // Apply assigned_to filter
    if (params.assigned_to) {
      query = query.eq('assigned_to', params.assigned_to);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching calendar events', error);
      return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('master_calendar_events')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)
      .is('deleted_at', null);

    return NextResponse.json({
      data,
      pagination: {
        total: totalCount || 0,
        limit: params.limit,
        offset: params.offset,
        hasMore: (params.offset + params.limit) < (totalCount || 0)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    logger.error('Error in GET /api/master-calendar', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const validatedData = CreateEventSchema.parse(body);

    // Validate datetime range
    if (new Date(validatedData.end_datetime) < new Date(validatedData.start_datetime)) {
      return NextResponse.json({ error: 'End datetime must be after start datetime' }, { status: 400 });
    }

    // Check for conflicts if venue/space is specified
    if (validatedData.venue_id || validatedData.space_id) {
      const { data: conflicts } = await supabase.rpc('check_calendar_conflicts', {
        p_organization_id: user.organization_id,
        p_start_datetime: validatedData.start_datetime,
        p_end_datetime: validatedData.end_datetime,
        p_venue_id: validatedData.venue_id || null,
        p_space_id: validatedData.space_id || null,
        p_exclude_event_id: null
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
      .insert({
        ...validatedData,
        organization_id: user.organization_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating calendar event', error);
      return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/master-calendar', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
