export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const TaskSchema = z.object({
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  production_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'blocked']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const projectId = searchParams.get('project_id');
    const productionId = searchParams.get('production_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assigned_to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects(id, name),
        productions(id, name),
        assignee:platform_users!assigned_to(id, full_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (productionId) {
      query = query.eq('production_id', productionId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tasks = data || [];
    const summary = {
      total: count || 0,
      by_status: {
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
      },
      by_priority: {
        urgent: tasks.filter(t => t.priority === 'urgent').length,
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
    };

    return NextResponse.json({
      tasks,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = TaskSchema.parse(body);

    const { data, error } = await supabase
      .from('tasks')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    logger.error('Error in POST /api/tasks:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
