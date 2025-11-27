import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Client onboarding workflows with automated touchpoints
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { client_id, template_id, custom_tasks } = body;

    // Get template tasks
    const { data: template } = await supabase.from('onboarding_templates').select('tasks').eq('id', template_id).single();
    const tasks = custom_tasks || template?.tasks || getDefaultTasks();

    // Create onboarding record
    const { data: onboarding, error } = await supabase.from('client_onboarding').insert({
      client_id, template_id, status: 'in_progress',
      started_at: new Date().toISOString(), started_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Create tasks
    const taskRecords = tasks.map((task: any, index: number) => ({
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, task_id } = body;

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
