export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const taskSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  due_days: z.number(),
  assigned_to: z.string().uuid().optional(),
});

const createOnboardingSchema = z.object({
  client_id: z.string().uuid(),
  template_id: z.string().uuid().optional(),
  custom_tasks: z.array(taskSchema).optional(),
});

const completeTaskSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('complete_task'),
  task_id: z.string().uuid(),
});

// Client onboarding workflows with automated touchpoints
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');

    let query = supabase.from('client_onboarding').select(`
      *, client:contacts(id, name, email, company),
      tasks:onboarding_tasks(id, name, status, due_date, completed_at)
    `);

    if (clientId) query = query.eq('client_id', clientId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('started_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      onboardings: data,
      in_progress: data?.filter(o => o.status === 'in_progress') || [],
      templates: await getOnboardingTemplates()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch onboardings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createOnboardingSchema.parse(body);
    const { client_id, template_id, custom_tasks } = validatedData;

    // Get template tasks
    const { data: template } = await supabase.from('onboarding_templates').select('tasks').eq('id', template_id).single();
    const tasks = custom_tasks || template?.tasks || getDefaultTasks();

    // Create onboarding record
    const { data: onboarding, error } = await supabase.from('client_onboarding').insert({
      client_id, template_id, status: 'in_progress',
      started_at: new Date().toISOString(), started_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Create tasks
    interface TaskInput { name: string; description?: string; due_days: number; assigned_to?: string }
    const taskRecords = tasks.map((task: TaskInput, index: number) => ({
      onboarding_id: onboarding.id,
      name: task.name,
      description: task.description,
      due_days: task.due_days,
      due_date: calculateDueDate(task.due_days),
      sequence: index + 1,
      status: 'pending',
      assigned_to: task.assigned_to || user.id
    }));

    await supabase.from('onboarding_tasks').insert(taskRecords);

    // Send welcome notification
    await supabase.from('notifications').insert({
      user_id: client_id,
      type: 'onboarding_started',
      title: 'Welcome! Your onboarding has begun',
      message: 'We\'re excited to work with you. Check your tasks to get started.'
    });

    return NextResponse.json({ onboarding, tasks: taskRecords }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start onboarding' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = completeTaskSchema.parse(body);
    const { id, action, task_id } = validatedData;

    if (action === 'complete_task') {
      await supabase.from('onboarding_tasks').update({
        status: 'completed', completed_at: new Date().toISOString()
      }).eq('id', task_id);

      // Check if all tasks complete
      const { data: tasks } = await supabase.from('onboarding_tasks').select('status').eq('onboarding_id', id);
      const allComplete = tasks?.every(t => t.status === 'completed');

      if (allComplete) {
        await supabase.from('client_onboarding').update({
          status: 'completed', completed_at: new Date().toISOString()
        }).eq('id', id);
      }

      return NextResponse.json({ success: true, all_complete: allComplete });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

async function getOnboardingTemplates() {
  const { data } = await supabase.from('onboarding_templates').select('id, name, description');
  return data || [];
}

function getDefaultTasks() {
  return [
    { name: 'Welcome call', description: 'Initial welcome and introduction call', due_days: 1 },
    { name: 'Account setup', description: 'Set up client account and access', due_days: 2 },
    { name: 'Requirements gathering', description: 'Document client requirements', due_days: 5 },
    { name: 'Kickoff meeting', description: 'Project kickoff meeting', due_days: 7 },
    { name: 'Training session', description: 'Platform training for client team', due_days: 14 }
  ];
}

function calculateDueDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
