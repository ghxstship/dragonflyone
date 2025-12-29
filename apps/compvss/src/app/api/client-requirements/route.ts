export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const requirementItemSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

const createRequirementSchema = z.object({
  project_id: z.string().uuid(),
  scope_summary: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  items: z.array(requirementItemSchema).optional(),
});

const approveSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('approve'),
});

const signOffSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('sign_off'),
});

const updateRequirementSchema = z.object({
  id: z.string().uuid(),
  scope_summary: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
});

const requirementPatchSchema = z.union([approveSchema, signOffSchema, updateRequirementSchema]);

// Client requirements documentation and scope definition
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

    let query = supabase.from('client_requirements').select(`
      *, project:projects(id, name, client_id),
      items:requirement_items(id, category, description, priority, status)
    `);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ requirements: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createRequirementSchema.parse(body);
    const { project_id, scope_summary, deliverables, constraints, assumptions, exclusions, items } = validatedData;

    const { data: requirement, error } = await supabase.from('client_requirements').insert({
      project_id, scope_summary, deliverables: deliverables || [],
      constraints: constraints || [], assumptions: assumptions || [],
      exclusions: exclusions || [], status: 'draft', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Add requirement items
    if (items?.length) {
      const itemRecords = items.map((item: Record<string, unknown>) => ({
        requirement_id: requirement.id,
        category: item.category,
        description: item.description,
        priority: item.priority || 'medium',
        status: 'pending'
      }));
      await supabase.from('requirement_items').insert(itemRecords);
    }

    return NextResponse.json({ requirement }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create requirements' }, { status: 500 });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = requirementPatchSchema.parse(body);
    const { id } = validatedData;

    if ('action' in validatedData && validatedData.action === 'approve') {
      await supabase.from('client_requirements').update({
        status: 'approved', approved_by: user.id, approved_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    if ('action' in validatedData && validatedData.action === 'sign_off') {
      await supabase.from('client_requirements').update({
        client_signed_off: true, signed_off_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('client_requirements').update(body).eq('id', id);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
