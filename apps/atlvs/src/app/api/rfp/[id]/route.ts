export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const updateRFPSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  project_type: z.string().max(100).optional(),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  submission_deadline: z.string().datetime().optional(),
  requirements: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'closed', 'awarded', 'cancelled']).optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const supabaseAdmin = createAdminClient();
    const { id } = await context.params;

    const { data: rfp, error } = await supabaseAdmin
      .from('rfps')
      .select(`
        *,
        created_by_user:platform_users!rfps_created_by_fkey(id, full_name, email),
        responses:rfp_responses(*)
      `)
      .eq('id', id)
      .single();

    if (error || !rfp) {
      return NextResponse.json(
        { error: 'RFP not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ rfp });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'rfp:view', resource: 'rfps' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const supabaseAdmin = createAdminClient();
    const { id } = await context.params;
    const body = await request.json();
    const updates = updateRFPSchema.parse(body);

    const { data: rfp, error } = await supabaseAdmin
      .from('rfps')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !rfp) {
      return NextResponse.json(
        { error: 'Failed to update RFP', message: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ rfp });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    validation: updateRFPSchema,
    audit: { action: 'rfp:update', resource: 'rfps' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const supabaseAdmin = createAdminClient();
    const { id } = await context.params;

    // Check if RFP can be deleted (only draft status)
    const { data: rfp, error: fetchError } = await supabaseAdmin
      .from('rfps')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !rfp) {
      return NextResponse.json(
        { error: 'RFP not found' },
        { status: 404 }
      );
    }

    if (rfp.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft RFPs can be deleted' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('rfps')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete RFP', message: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    audit: { action: 'rfp:delete', resource: 'rfps' },
  }
);
