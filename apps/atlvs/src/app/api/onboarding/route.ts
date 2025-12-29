export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createWorkflowSchema = z.object({
  employee_id: z.string().uuid(),
  workflow_type: z.enum(['onboarding', 'offboarding']),
  start_date: z.string().optional(),
  template_id: z.string().uuid().optional(),
});

const completeTaskSchema = z.object({
  task_id: z.string().uuid(),
  workflow_id: z.string().uuid(),
  action: z.literal('complete'),
});

// Automated onboarding/offboarding workflows
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
    const employeeId = searchParams.get('employee_id');
    const type = searchParams.get('type'); // 'onboarding', 'offboarding'

    let query = supabase.from('employee_workflows').select(`
      *, employee:employees(id, first_name, last_name, department),
      tasks:workflow_tasks(*)
    `);

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (type) query = query.eq('workflow_type', type);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      workflows: data,
      in_progress: data?.filter(w => w.status === 'in_progress') || [],
      stats: {
        total: data?.length || 0,
        completed: data?.filter(w => w.status === 'completed').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
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
    const validatedData = createWorkflowSchema.parse(body);
    const { employee_id, workflow_type, start_date, template_id } = validatedData;

    // Create workflow
    const { data: workflow, error } = await supabase.from('employee_workflows').insert({
      employee_id, workflow_type, start_date: start_date || new Date().toISOString(),
      status: 'in_progress', created_by: user.id, template_id: template_id || null
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Create default tasks based on type
    const tasks = workflow_type === 'onboarding' ? [
      { title: 'Complete I-9 form', category: 'hr', due_days: 3 },
      { title: 'Set up workstation', category: 'it', due_days: 1 },
      { title: 'Create email account', category: 'it', due_days: 1 },
      { title: 'Benefits enrollment', category: 'hr', due_days: 30 },
      { title: 'Safety training', category: 'training', due_days: 7 },
      { title: 'Department orientation', category: 'training', due_days: 5 },
      { title: 'System access setup', category: 'it', due_days: 2 },
      { title: 'Handbook acknowledgment', category: 'hr', due_days: 7 }
    ] : [
      { title: 'Return equipment', category: 'it', due_days: 0 },
      { title: 'Revoke system access', category: 'it', due_days: 0 },
      { title: 'Exit interview', category: 'hr', due_days: -3 },
      { title: 'Final paycheck', category: 'hr', due_days: 0 },
      { title: 'Benefits termination', category: 'hr', due_days: 0 },
      { title: 'Knowledge transfer', category: 'department', due_days: -7 }
    ];

    const startDate = new Date(workflow.start_date);
    const taskRecords = tasks.map((t, i) => {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + t.due_days);
      return {
        workflow_id: workflow.id, title: t.title, category: t.category,
        due_date: dueDate.toISOString(), order_index: i, status: 'pending'
      };
    });

    await supabase.from('workflow_tasks').insert(taskRecords);

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = completeTaskSchema.parse(body);
    const { task_id, workflow_id, action } = validatedData;

    if (task_id && action === 'complete') {
      await supabase.from('workflow_tasks').update({
        status: 'completed', completed_at: new Date().toISOString(), completed_by: user.id
      }).eq('id', task_id);

      // Check if all tasks complete
      const { data: tasks } = await supabase.from('workflow_tasks')
        .select('status').eq('workflow_id', workflow_id);
      
      if (tasks?.every(t => t.status === 'completed')) {
        await supabase.from('employee_workflows').update({
          status: 'completed', completed_at: new Date().toISOString()
        }).eq('id', workflow_id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
