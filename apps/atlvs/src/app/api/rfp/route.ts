import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const createRFPSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  project_type: z.string().max(100),
  budget_min: z.number().positive().optional(),
  budget_max: z.number().positive().optional(),
  deadline: z.string().datetime(),
  submission_deadline: z.string().datetime(),
  requirements: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    const supabaseAdmin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabaseAdmin
      .from('rfps')
      .select(`
        *,
        created_by_user:platform_users!rfps_created_by_fkey(id, full_name, email),
        responses:rfp_responses(count)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('project_type', type);
    }

    const { data: rfps, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch RFPs', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ rfps: rfps || [] });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'rfp:list', resource: 'rfps' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const data = createRFPSchema.parse(body);

    const { data: rfp, error } = await supabaseAdmin
      .from('rfps')
      .insert({
        ...data,
        status: 'draft',
        created_by: context.user.id,
      })
      .select()
      .single();

    if (error || !rfp) {
      return NextResponse.json(
        { error: 'Failed to create RFP', message: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ rfp }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    validation: createRFPSchema,
    audit: { action: 'rfp:create', resource: 'rfps' },
  }
);
