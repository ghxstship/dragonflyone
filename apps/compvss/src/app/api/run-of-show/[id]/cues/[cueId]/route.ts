import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as _supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const supabaseAdmin = _supabaseAdmin as any;
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

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

export const PATCH = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id, cueId } = context.params;
    const body = await request.json();
    
    const updates = updateCueSchema.parse(body);

    const { data: cue, error } = await supabaseAdmin
      .from('run_of_show_cues')
      .update(updates)
      .eq('id', cueId)
      .eq('run_of_show_id', id)
      .select()
      .single();

    if (error || !cue) {
      return NextResponse.json(
        { error: 'Failed to update cue', message: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ cue });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    validation: updateCueSchema,
    audit: { action: 'cue:update', resource: 'run_of_show_cues' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id, cueId } = context.params;

    const { error } = await supabaseAdmin
      .from('run_of_show_cues')
      .delete()
      .eq('id', cueId)
      .eq('run_of_show_id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete cue', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'cue:delete', resource: 'run_of_show_cues' },
  }
);
