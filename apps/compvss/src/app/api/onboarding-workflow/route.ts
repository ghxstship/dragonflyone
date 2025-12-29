export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const initiateSchema = z.object({
  action: z.literal('initiate'),
  user_id: z.string().uuid(),
  position: z.string().min(1),
  start_date: z.string(),
  template_id: z.string().uuid().optional(),
});

const completeTaskSchema = z.object({
  action: z.literal('complete_task'),
  task_id: z.string().uuid(),
  notes: z.string().optional(),
});

const uploadDocumentSchema = z.object({
  action: z.literal('upload_document'),
  workflow_id: z.string().uuid(),
  name: z.string().min(1),
  document_type: z.string().min(1),
  file_url: z.string().url(),
});

const onboardingActionSchema = z.union([initiateSchema, completeTaskSchema, uploadDocumentSchema]);

// Onboarding workflow initiation
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
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    let query = supabase.from('onboarding_workflows').select(`
      *, tasks:onboarding_tasks(id, title, category, required, completed, due_date),
      documents:onboarding_documents(id, name, status, uploaded_at)
    `);

    if (userId) query = query.eq('user_id', userId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ workflows: data });
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
    const validatedData = onboardingActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'initiate') {
      const { user_id, position, start_date, template_id } = validatedData as z.infer<typeof initiateSchema>;

      const { data, error } = await supabase.from('onboarding_workflows').insert({
        user_id, position, start_date, template_id, status: 'pending', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Create default tasks from template
      const { data: template } = await supabase.from('onboarding_templates').select('tasks').eq('id', template_id).single();

      if (template?.tasks) {
        await supabase.from('onboarding_tasks').insert(
          template.tasks.map((t: Record<string, unknown>) => ({
            workflow_id: data.id, title: t.title, category: t.category,
            required: t.required, due_days: t.due_days
          }))
        );
      }

      return NextResponse.json({ workflow: data }, { status: 201 });
    }

    if (action === 'complete_task') {
      const { task_id, notes } = validatedData as z.infer<typeof completeTaskSchema>;

      await supabase.from('onboarding_tasks').update({
        completed: true, completed_at: new Date().toISOString(), notes
      }).eq('id', task_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'upload_document') {
      const { workflow_id, name, document_type, file_url } = validatedData as z.infer<typeof uploadDocumentSchema>;

      const { data, error } = await supabase.from('onboarding_documents').insert({
        workflow_id, name, document_type, file_url, status: 'pending_review', uploaded_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ document: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
