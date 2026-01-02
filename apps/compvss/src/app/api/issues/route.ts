export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createIssueSchema = z.object({
  project_id: z.string().uuid().optional(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  priority: z.string(),
  department: z.string().optional(),
  location: z.string().optional(),
});

const updateIssueSchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  resolution: z.string().optional(),
  escalation_level: z.number().optional(),
});

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
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    let query = supabase
      .from('production_issues')
      .select(`
        *,
        reporter:platform_users!production_issues_reported_by_fkey(id, first_name, last_name),
        assignee:platform_users!production_issues_assigned_to_fkey(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    interface PersonData { first_name?: string; last_name?: string }
    const issues = data?.map(i => {
      const reporter = i.reporter as PersonData | null;
      const assignee = i.assignee as PersonData | null;
      return {
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category,
        priority: i.priority,
        status: i.status,
        reported_by: reporter ? `${reporter.first_name} ${reporter.last_name}` : 'Unknown',
        assigned_to: assignee ? `${assignee.first_name} ${assignee.last_name}` : null,
        department: i.department,
        location: i.location,
        created_at: i.created_at,
        updated_at: i.updated_at,
        escalation_level: i.escalation_level || 0,
        resolution: i.resolution,
      };
    }) || [];

    return NextResponse.json({ issues });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createIssueSchema.parse(body);
    const { project_id, title, description, category, priority, department, location } = validatedData;

    if (!title || !category || !priority) {
      return NextResponse.json(
        { error: 'Title, category, and priority are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('production_issues')
      .insert({
        project_id,
        title,
        description,
        category,
        priority,
        department,
        location,
        status: 'open',
        reported_by: userId,
        escalation_level: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ issue: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    const body = await request.json();
    const validatedData = updateIssueSchema.parse(body);
    const { id, status, assigned_to, resolution, escalation_level } = validatedData;

    if (!id) {
      return NextResponse.json({ error: 'Issue ID required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (assigned_to) updates.assigned_to = assigned_to;
    if (resolution) updates.resolution = resolution;
    if (escalation_level !== undefined) updates.escalation_level = escalation_level;

    const { data, error } = await supabase
      .from('production_issues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ issue: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
