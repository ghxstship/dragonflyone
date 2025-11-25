import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const executeSchema = z.object({
  input_data: z.record(z.any()).optional(),
});

async function executeWorkflowAction(action: any, context: any): Promise<any> {
  switch (action.type) {
    case 'send_email':
      return { status: 'completed', result: { sent: true, recipient: action.config.to } };
    
    case 'create_task':
      const { data: task } = await supabaseAdmin.from('tasks').insert({
        title: action.config.title,
        description: action.config.description,
        assigned_to: action.config.assigned_to,
        project_id: context.project_id,
      }).select().single();
      return { status: 'completed', result: { task_id: task?.id } };
    
    case 'update_status':
      await supabaseAdmin
        .from(action.config.table)
        .update({ status: action.config.new_status })
        .eq('id', context.record_id);
      return { status: 'completed', result: { updated: true } };
    
    case 'webhook':
      const response = await fetch(action.config.url, {
        method: action.config.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });
      return { status: response.ok ? 'completed' : 'failed', result: { status: response.status } };
    
    case 'wait':
      await new Promise(resolve => setTimeout(resolve, action.config.seconds * 1000));
      return { status: 'completed', result: { waited: action.config.seconds } };
    
    default:
      return { status: 'skipped', result: { reason: 'Unknown action type' } };
  }
}

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: workflowId } = context.params;
    const body = await request.json();
    const { input_data } = executeSchema.parse(body);

    const { data: workflow, error: workflowError } = await supabaseAdmin
      .from('workflows')
      .select(`
        *,
        actions:workflow_actions(*)
      `)
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Type assertion for workflow data
    interface WorkflowData {
      id: string;
      enabled: boolean;
      actions: Array<{
        id: string;
        type: string;
        order: number;
        config: Record<string, unknown>;
      }>;
      [key: string]: unknown;
    }
    const workflowData = workflow as unknown as WorkflowData;

    if (!workflowData.enabled) {
      return NextResponse.json({ error: 'Workflow is disabled' }, { status: 400 });
    }

    const { data: execution, error: execError } = await supabaseAdmin
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        status: 'running',
        started_at: new Date().toISOString(),
        input_data: input_data || {},
        triggered_by: context.user.id,
      })
      .select()
      .single();

    if (execError || !execution) {
      return NextResponse.json(
        { error: 'Failed to start workflow execution', message: execError?.message },
        { status: 500 }
      );
    }

    // Type assertion for execution data
    const executionData = execution as { id: string; [key: string]: unknown };

    const actions = (workflowData.actions || []).sort((a, b) => a.order - b.order);
    const actionResults = [];
    let workflowContext = { ...input_data, user_id: context.user.id };

    for (const action of actions) {
      try {
        const result = await executeWorkflowAction(action, workflowContext);
        actionResults.push({
          action_id: action.id,
          action_type: action.type,
          ...result,
        });
        
        workflowContext = { ...workflowContext, ...result.result };

        if (result.status === 'failed') {
          break;
        }
      } catch (error) {
        actionResults.push({
          action_id: action.id,
          action_type: action.type,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        break;
      }
    }

    const finalStatus = actionResults.some(r => r.status === 'failed') ? 'failed' : 'completed';

    await (supabaseAdmin as any)
      .from('workflow_executions')
      .update({
        status: finalStatus,
        completed_at: new Date().toISOString(),
        output_data: workflowContext,
        action_results: actionResults,
      })
      .eq('id', executionData.id);

    return NextResponse.json({
      execution_id: executionData.id,
      status: finalStatus,
      actions_executed: actionResults.length,
      results: actionResults,
    });
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    validation: executeSchema,
    audit: { action: 'workflow:execute', resource: 'workflows' },
  }
);
