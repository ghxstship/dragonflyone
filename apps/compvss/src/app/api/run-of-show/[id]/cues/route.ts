import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const createCueSchema = z.object({
  time: z.string(),
  cue_number: z.string().max(50),
  description: z.string().min(1).max(500),
  department: z.string().max(100).optional(),
  assigned_to: z.string().uuid().optional(),
  duration_minutes: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  order: z.number().int().nonnegative().optional(),
});

const updateCueSchema = z.object({
  time: z.string().optional(),
  cue_number: z.string().max(50).optional(),
  description: z.string().min(1).max(500).optional(),
  department: z.string().max(100).optional(),
  assigned_to: z.string().uuid().optional(),
  duration_minutes: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  order: z.number().int().nonnegative().optional(),
  status: z.enum(['pending', 'ready', 'in_progress', 'completed', 'skipped']).optional(),
});

const bulkUpdateSchema = z.object({
  cues: z.array(z.object({
    id: z.string().uuid(),
    order: z.number().int().nonnegative(),
  })),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id } = context.params;

    const { data: cues, error } = await supabaseAdmin
      .from('run_of_show_cues')
      .select(`
        *,
        assigned_crew:platform_users(id, full_name, email, role)
      `)
      .eq('run_of_show_id', id)
      .order('order', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch cues', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ cues: cues || [] });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'cues:list', resource: 'run_of_show_cues' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id } = context.params;
    const body = await request.json();
    const data = createCueSchema.parse(body);

    const { data: cue, error } = await supabaseAdmin
      .from('run_of_show_cues')
      .insert({
        run_of_show_id: id,
        ...data,
      })
      .select()
      .single();

    if (error || !cue) {
      return NextResponse.json(
        { error: 'Failed to create cue', message: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ cue }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    validation: createCueSchema,
    audit: { action: 'cue:create', resource: 'run_of_show_cues' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id } = context.params;
    const body = await request.json();
    
    if (body.cues && Array.isArray(body.cues)) {
      const { cues } = bulkUpdateSchema.parse(body);
      
      const updates = cues.map(cue =>
        supabaseAdmin
          .from('run_of_show_cues')
          .update({ order: cue.order })
          .eq('id', cue.id)
          .eq('run_of_show_id', id)
      );

      await Promise.all(updates);

      return NextResponse.json({ success: true, updated: cues.length });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'cues:bulk_update', resource: 'run_of_show_cues' },
  }
);
