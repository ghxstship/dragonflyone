import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  trigger_type: z.enum(['manual', 'schedule', 'event', 'webhook']),
  trigger_config: z.record(z.any()).optional(),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.any()),
    order: z.number().int().nonnegative(),
  })),
  enabled: z.boolean().default(true),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const triggerType = searchParams.get('trigger_type');

    let query = supabaseAdmin
      .from('workflows')
      .select(`
        *,
        created_by_user:platform_users!workflows_created_by_fkey(id, full_name, email),
        executions:workflow_executions(count)
      `);

    if (status) {
      query = query.eq('enabled', status === 'enabled');
    }

    if (triggerType) {
      query = query.eq('trigger_type', triggerType);
    }

    const { data: workflows, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch workflows', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ workflows: workflows || [] });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    audit: { action: 'workflows:list', resource: 'workflows' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const data = createWorkflowSchema.parse(body);

    const { data: workflow, error: workflowError } = await supabaseAdmin
      .from('workflows')
      .insert({
        name: data.name,
        description: data.description,
        trigger_type: data.trigger_type,
        trigger_config: data.trigger_config || {},
        enabled: data.enabled,
        created_by: context.user.id,
      })
      .select()
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: 'Failed to create workflow', message: workflowError?.message },
        { status: 500 }
      );
    }

    // Type assertion for workflow data
    const workflowData = workflow as { id: string; [key: string]: unknown };

    if (data.actions && data.actions.length > 0) {
      const actionsToInsert = data.actions.map((action) => ({
        workflow_id: workflowData.id,
        type: action.type,
        config: action.config,
        order: action.order,
      }));

      const { error: actionsError } = await (supabaseAdmin as any)
        .from('workflow_actions')
        .insert(actionsToInsert);

      if (actionsError) {
        console.error('Failed to create workflow actions:', actionsError);
      }
    }

    const { data: completeWorkflow } = await supabaseAdmin
      .from('workflows')
      .select(`
        *,
        actions:workflow_actions(*)
      `)
      .eq('id', workflowData.id)
      .single();

    return NextResponse.json({ workflow: completeWorkflow }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN],
    validation: createWorkflowSchema,
    audit: { action: 'workflow:create', resource: 'workflows' },
  }
);
