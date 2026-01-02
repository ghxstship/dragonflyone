export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createCheckpointSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  department: z.string().optional(),
  sequence: z.number().optional(),
  criteria: z.array(z.string()).optional(),
});

const signOffSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('sign_off'),
  notes: z.string().optional(),
  photo_urls: z.array(z.string()).optional(),
  issues: z.array(z.string()).optional(),
});

const failSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('fail'),
  notes: z.string().optional(),
  issues: z.array(z.string()).optional(),
});

const checkpointActionSchema = z.union([signOffSchema, failSchema]);

// QA checkpoints with digital sign-offs
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase.from('qa_checkpoints').select(`
      *, signed_by:platform_users(id, first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query.order('sequence', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    const completed = data?.filter(c => c.status === 'passed').length || 0;
    const total = data?.length || 0;

    return NextResponse.json({
      checkpoints: data,
      progress: { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch checkpoints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createCheckpointSchema.parse(body);
    const { project_id, name, description, department, sequence, criteria } = validatedData;

    const { data, error } = await supabase.from('qa_checkpoints').insert({
      project_id, name, description, department, sequence, criteria: criteria || [],
      status: 'pending', created_by: userId
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ checkpoint: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkpoint' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = checkpointActionSchema.parse(body);
    const { id, action, notes, issues } = validatedData;

    if (action === 'sign_off') {
      const { photo_urls } = validatedData as z.infer<typeof signOffSchema>;
      await supabase.from('qa_checkpoints').update({
        status: 'passed', signed_by: userId, signed_at: new Date().toISOString(),
        notes, photo_urls: photo_urls || []
      }).eq('id', id);

      return NextResponse.json({ success: true, message: 'Checkpoint signed off' });
    }

    if (action === 'fail') {
      await supabase.from('qa_checkpoints').update({
        status: 'failed', notes, issues: issues || [], reviewed_by: userId
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
