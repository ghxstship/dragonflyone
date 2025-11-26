import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin, fromDynamic } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

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
  async (request: NextRequest, context: any) => {
    const { id } = context.params;

    const { data: runOfShow, error } = await fromDynamic(supabaseAdmin, 'run_of_shows')
      .select(`
        *,
        project:projects(id, name, status, client_name),
        venue:venues(id, name, location, capacity),
        cues:run_of_show_cues(
          *,
          assigned_crew:platform_users(id, full_name, email, role)
        ),
        created_by_user:platform_users!run_of_shows_created_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error || !runOfShow) {
      return NextResponse.json(
        { error: 'Run of show not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ runOfShow });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'run_of_show:view', resource: 'run_of_shows' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id } = context.params;
    const body = await request.json();
    
    const updates = updateRunOfShowSchema.parse(body);

    const { data: runOfShow, error } = await fromDynamic(supabaseAdmin, 'run_of_shows')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !runOfShow) {
      return NextResponse.json(
        { error: 'Failed to update run of show', message: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ runOfShow });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    validation: updateRunOfShowSchema,
    audit: { action: 'run_of_show:update', resource: 'run_of_shows' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id } = context.params;

    // Delete all cues first
    await fromDynamic(supabaseAdmin, 'run_of_show_cues')
      .delete()
      .eq('run_of_show_id', id);

    // Delete run of show
    const { error } = await fromDynamic(supabaseAdmin, 'run_of_shows')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete run of show', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'run_of_show:delete', resource: 'run_of_shows' },
  }
);
