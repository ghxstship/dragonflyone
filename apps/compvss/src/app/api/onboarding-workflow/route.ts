import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Onboarding workflow initiation
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    let query = supabase.from('onboarding_workflows').select(`
      *, tasks:onboarding_tasks(id, title, category, required, completed, due_date),
      documents:onboarding_documents(id, name, status, uploaded_at)
    `);

    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ workflows: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'initiate') {
      const { user_id, position, start_date, template_id } = body;

      const { data, error } = await supabase.from('onboarding_workflows').insert({
        user_id, position, start_date, template_id, status: 'pending', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Create default tasks from template
      const { data: template } = await supabase.from('onboarding_templates').select('tasks').eq('id', template_id).single();

      if (template?.tasks) {
        await supabase.from('onboarding_tasks').insert(
          template.tasks.map((t: any) => ({
            workflow_id: data.id, title: t.title, category: t.category,
            required: t.required, due_days: t.due_days
          }))
        );
      }

      return NextResponse.json({ workflow: data }, { status: 201 });
    }

    if (action === 'complete_task') {
      const { task_id, notes } = body;

      await supabase.from('onboarding_tasks').update({
        completed: true, completed_at: new Date().toISOString(), notes
      }).eq('id', task_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'upload_document') {
      const { workflow_id, name, document_type, file_url } = body;

      const { data, error } = await supabase.from('onboarding_documents').insert({
        workflow_id, name, document_type, file_url, status: 'pending_review', uploaded_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ document: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
