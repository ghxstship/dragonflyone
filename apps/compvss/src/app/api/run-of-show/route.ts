import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, fromDynamic } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const createRunOfShowSchema = z.object({
  project_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  date: z.string().datetime(),
  venue_id: z.string().uuid().optional(),
  notes: z.string().max(5000).optional(),
  cues: z.array(z.object({
    time: z.string(), // Format: HH:MM or HH:MM:SS
    cue_number: z.string().max(50),
    description: z.string().min(1).max(500),
    department: z.string().max(100).optional(),
    assigned_to: z.string().uuid().optional(),
    duration_minutes: z.number().int().positive().optional(),
    notes: z.string().max(1000).optional(),
  })).optional(),
});

const updateRunOfShowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  date: z.string().datetime().optional(),
  venue_id: z.string().uuid().optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(['draft', 'published', 'in_progress', 'completed', 'cancelled']).optional(),
});

const addCueSchema = z.object({
  time: z.string(),
  cue_number: z.string().max(50),
  description: z.string().min(1).max(500),
  department: z.string().max(100).optional(),
  assigned_to: z.string().uuid().optional(),
  duration_minutes: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  order: z.number().int().nonnegative().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = fromDynamic(supabaseAdmin, 'run_of_shows')
      .select(`
        *,
        project:projects(id, name, status),
        venue:venues(id, name, location),
        cues:run_of_show_cues(
          *,
          assigned_crew:platform_users(id, full_name, email)
        )
      `);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: runOfShows, error } = await query.order('date', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch run of shows', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ runOfShows: runOfShows || [] });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'run_of_show:list', resource: 'run_of_shows' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const data = createRunOfShowSchema.parse(body);

    // Create run of show
    const { data: runOfShow, error: rosError } = await fromDynamic(supabaseAdmin, 'run_of_shows')
      .insert({
        project_id: data.project_id,
        event_id: data.event_id,
        name: data.name,
        date: data.date,
        venue_id: data.venue_id,
        notes: data.notes,
        status: 'draft',
        created_by: context.user.id,
      })
      .select()
      .single();

    if (rosError || !runOfShow) {
      return NextResponse.json(
        { error: 'Failed to create run of show', message: rosError?.message },
        { status: 500 }
      );
    }

    // Create cues if provided
    if (data.cues && data.cues.length > 0) {
      const cuesWithIds = data.cues.map((cue, index) => ({
        run_of_show_id: runOfShow.id,
        time: cue.time,
        cue_number: cue.cue_number,
        description: cue.description,
        department: cue.department,
        assigned_to: cue.assigned_to,
        duration_minutes: cue.duration_minutes,
        notes: cue.notes,
        order: index,
      }));

      const { error: cuesError } = await fromDynamic(supabaseAdmin, 'run_of_show_cues')
        .insert(cuesWithIds);

      if (cuesError) {
        console.error('Failed to create cues:', cuesError);
      }
    }

    // Fetch complete run of show with cues
    const { data: completeROS } = await fromDynamic(supabaseAdmin, 'run_of_shows')
      .select(`
        *,
        cues:run_of_show_cues(*)
      `)
      .eq('id', runOfShow.id)
      .single();

    return NextResponse.json({ runOfShow: completeROS }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    validation: createRunOfShowSchema,
    audit: { action: 'run_of_show:create', resource: 'run_of_shows' },
  }
);
