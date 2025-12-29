export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const taskSchema = z.object({
  task: z.string().min(1),
  department: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

const createPlanSchema = z.object({
  action: z.literal('create_plan'),
  event_id: z.string().uuid(),
  plan_type: z.enum(['strike', 'reset', 'load_out']).optional(),
  tasks: z.array(taskSchema).optional(),
});

const initiateSchema = z.object({
  action: z.literal('initiate'),
  event_id: z.string().uuid().optional(),
  plan_id: z.string().uuid(),
});

const completeTaskSchema = z.object({
  action: z.literal('complete_task'),
  event_id: z.string().uuid().optional(),
  task_id: z.string().uuid(),
});

const postShowActionSchema = z.union([createPlanSchema, initiateSchema, completeTaskSchema]);

// Post-show reset/strike initiation
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
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('post_show_plans').select(`
      *, tasks:post_show_tasks(id, task, department, assigned_to, sequence, status)
    `).eq('event_id', eventId).single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    const completed = data?.tasks?.filter((t: Record<string, unknown>) => t.status === 'completed').length || 0;
    const total = data?.tasks?.length || 0;

    return NextResponse.json({
      plan: data,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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
    const validatedData = postShowActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_plan') {
      const { event_id, plan_type, tasks } = validatedData as z.infer<typeof createPlanSchema>;

      const { data, error } = await supabase.from('post_show_plans').insert({
        event_id, plan_type: plan_type || 'strike', status: 'pending', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      interface PostShowTask { task: string; department?: string; assigned_to?: string }
      if (tasks?.length) {
        await supabase.from('post_show_tasks').insert(
          tasks.map((t: PostShowTask, i: number) => ({
            plan_id: data.id, task: t.task, department: t.department,
            assigned_to: t.assigned_to, sequence: i + 1, status: 'pending'
          }))
        );
      }

      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'initiate') {
      const { plan_id } = validatedData as z.infer<typeof initiateSchema>;

      await supabase.from('post_show_plans').update({
        status: 'in_progress', initiated_at: new Date().toISOString(), initiated_by: user.id
      }).eq('id', plan_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'complete_task') {
      const { task_id } = validatedData as z.infer<typeof completeTaskSchema>;

      await supabase.from('post_show_tasks').update({
        status: 'completed', completed_at: new Date().toISOString(), completed_by: user.id
      }).eq('id', task_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
