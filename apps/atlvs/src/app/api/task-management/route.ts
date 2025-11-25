import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  task_type: z.enum(['follow_up', 'call', 'email', 'meeting', 'task', 'deadline', 'other']).default('task'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().optional(),
  reminder_at: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  recurrence: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().int().default(1),
    until: z.string().optional(),
  }).optional(),
});

// GET /api/task-management - Get tasks with filters
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assigned_to');
    const contactId = searchParams.get('contact_id');
    const dealId = searchParams.get('deal_id');
    const projectId = searchParams.get('project_id');
    const dueBefore = searchParams.get('due_before');
    const dueAfter = searchParams.get('due_after');
    const overdue = searchParams.get('overdue') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('crm_tasks')
      .select(`
        *,
        assigned_user:platform_users!crm_tasks_assigned_to_fkey(id, first_name, last_name, email),
        contact:contacts(id, first_name, last_name, email, company),
        deal:deals(id, name, stage),
        project:projects(id, name)
      `, { count: 'exact' })
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .order('due_date', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.neq('status', 'completed').neq('status', 'cancelled');
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (dealId) {
      query = query.eq('deal_id', dealId);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (dueBefore) {
      query = query.lte('due_date', dueBefore);
    }

    if (dueAfter) {
      query = query.gte('due_date', dueAfter);
    }

    if (overdue) {
      query = query.lt('due_date', new Date().toISOString()).neq('status', 'completed');
    }

    const { data: tasks, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get task counts by status
    const { data: statusCounts } = await supabase
      .from('crm_tasks')
      .select('status')
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`);

    const counts: Record<string, number> = {};
    statusCounts?.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });

    // Get overdue count
    const { count: overdueCount } = await supabase
      .from('crm_tasks')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .lt('due_date', new Date().toISOString())
      .neq('status', 'completed')
      .neq('status', 'cancelled');

    return NextResponse.json({
      tasks: tasks || [],
      total: count || 0,
      status_counts: counts,
      overdue_count: overdueCount || 0,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/task-management - Create task
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = TaskSchema.parse(body);

    const { data: task, error } = await supabase
      .from('crm_tasks')
      .insert({
        user_id: user.id,
        assigned_to: validated.assigned_to || user.id,
        contact_id: validated.contact_id,
        deal_id: validated.deal_id,
        project_id: validated.project_id,
        title: validated.title,
        description: validated.description,
        task_type: validated.task_type,
        priority: validated.priority,
        due_date: validated.due_date,
        reminder_at: validated.reminder_at,
        recurrence: validated.recurrence,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create reminder notification if reminder_at is set
    if (validated.reminder_at) {
      await supabase.from('scheduled_notifications').insert({
        user_id: validated.assigned_to || user.id,
        type: 'task_reminder',
        title: 'Task Reminder',
        message: validated.title,
        link: `/tasks/${task.id}`,
        scheduled_for: validated.reminder_at,
        reference_type: 'task',
        reference_id: task.id,
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PATCH /api/task-management - Update task
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const body = await request.json();

    // Handle completion
    if (body.status === 'completed') {
      body.completed_at = new Date().toISOString();
      body.completed_by = user.id;

      // Check for recurrence
      const { data: existingTask } = await supabase
        .from('crm_tasks')
        .select('recurrence, title, description, task_type, priority, assigned_to, contact_id, deal_id, project_id')
        .eq('id', taskId)
        .single();

      if (existingTask?.recurrence) {
        // Create next recurring task
        const recurrence = existingTask.recurrence as { frequency: string; interval: number; until?: string };
        let nextDueDate = new Date(body.due_date || new Date());

        switch (recurrence.frequency) {
          case 'daily':
            nextDueDate.setDate(nextDueDate.getDate() + recurrence.interval);
            break;
          case 'weekly':
            nextDueDate.setDate(nextDueDate.getDate() + (7 * recurrence.interval));
            break;
          case 'monthly':
            nextDueDate.setMonth(nextDueDate.getMonth() + recurrence.interval);
            break;
        }

        // Only create if before until date
        if (!recurrence.until || nextDueDate <= new Date(recurrence.until)) {
          await supabase.from('crm_tasks').insert({
            user_id: user.id,
            assigned_to: existingTask.assigned_to,
            contact_id: existingTask.contact_id,
            deal_id: existingTask.deal_id,
            project_id: existingTask.project_id,
            title: existingTask.title,
            description: existingTask.description,
            task_type: existingTask.task_type,
            priority: existingTask.priority,
            due_date: nextDueDate.toISOString(),
            recurrence: existingTask.recurrence,
            status: 'pending',
          });
        }
      }
    }

    const { data: task, error } = await supabase
      .from('crm_tasks')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/task-management - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('crm_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
