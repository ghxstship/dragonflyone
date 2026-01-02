export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

interface TriggerInput { type: string; config?: Record<string, unknown> }
interface ActionInput { type: string; config?: Record<string, unknown> }

const triggerSchema = z.object({
  type: z.string(),
  config: z.record(z.unknown()).optional(),
});

const actionSchema = z.object({
  type: z.string(),
  config: z.record(z.unknown()).optional(),
});

const createWorkflowSchema = z.object({
  action: z.literal('create'),
  name: z.string().min(1),
  description: z.string().optional(),
  triggers: z.array(triggerSchema).optional(),
  actions: z.array(actionSchema).optional(),
});

const updateWorkflowSchema = z.object({
  action: z.literal('update'),
  workflow_id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  triggers: z.array(triggerSchema).optional(),
  actions: z.array(actionSchema).optional(),
});

const activateWorkflowSchema = z.object({
  action: z.literal('activate'),
  workflow_id: z.string().uuid(),
});

const deactivateWorkflowSchema = z.object({
  action: z.literal('deactivate'),
  workflow_id: z.string().uuid(),
});

const executeWorkflowSchema = z.object({
  action: z.literal('execute'),
  workflow_id: z.string().uuid(),
  trigger_data: z.record(z.unknown()).optional(),
});

const deleteWorkflowSchema = z.object({
  action: z.literal('delete'),
  workflow_id: z.string().uuid(),
});

const duplicateWorkflowSchema = z.object({
  action: z.literal('duplicate'),
  workflow_id: z.string().uuid(),
  new_name: z.string().optional(),
});

const workflowActionSchema = z.discriminatedUnion('action', [
  createWorkflowSchema,
  updateWorkflowSchema,
  activateWorkflowSchema,
  deactivateWorkflowSchema,
  executeWorkflowSchema,
  deleteWorkflowSchema,
  duplicateWorkflowSchema,
]);

/**
 * Workflow Automation API
 * Create, manage, and execute automated workflows with triggers and actions
 */
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
    const type = searchParams.get('type');
    const workflowId = searchParams.get('workflow_id');
    const status = searchParams.get('status');

    if (type === 'workflows') {
      // List all workflows
      let query = supabase
        .from('saga_instances')
        .select(`
          *,
          triggers:workflow_triggers(*),
          actions:workflow_actions(*),
          executions:workflow_executions(id, status, started_at, completed_at)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ workflows: data });
    }

    if (type === 'workflow' && workflowId) {
      // Get specific workflow
      const { data, error } = await supabase
        .from('saga_instances')
        .select(`
          *,
          triggers:workflow_triggers(*),
          actions:workflow_actions(*),
          executions:workflow_executions(*)
        `)
        .eq('id', workflowId)
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ workflow: data });
    }

    if (type === 'executions') {
      // Get workflow execution history
      let query = supabase
        .from('workflow_executions')
        .select(`
          *,
          workflow:workflows(id, name),
          steps:workflow_execution_steps(*)
        `)
        .order('started_at', { ascending: false });

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ executions: data });
    }

    if (type === 'triggers') {
      // List available trigger types
      const triggers = [
        { id: 'deal_created', name: 'Deal Created', category: 'crm', fields: ['deal_id', 'name', 'value'] },
        { id: 'deal_stage_changed', name: 'Deal Stage Changed', category: 'crm', fields: ['deal_id', 'old_stage', 'new_stage'] },
        { id: 'invoice_created', name: 'Invoice Created', category: 'finance', fields: ['invoice_id', 'amount', 'client_id'] },
        { id: 'invoice_paid', name: 'Invoice Paid', category: 'finance', fields: ['invoice_id', 'amount', 'paid_at'] },
        { id: 'expense_submitted', name: 'Expense Submitted', category: 'finance', fields: ['expense_id', 'amount', 'category'] },
        { id: 'asset_maintenance_due', name: 'Asset Maintenance Due', category: 'assets', fields: ['asset_id', 'due_date'] },
        { id: 'contract_expiring', name: 'Contract Expiring', category: 'contracts', fields: ['contract_id', 'expires_at', 'days_until'] },
        { id: 'schedule', name: 'Scheduled Time', category: 'time', fields: ['cron', 'timezone'] },
        { id: 'webhook', name: 'Webhook Received', category: 'external', fields: ['url', 'method'] }
      ];

      return NextResponse.json({ triggers });
    }

    if (type === 'actions') {
      // List available action types
      const actions = [
        { id: 'send_email', name: 'Send Email', category: 'notification', fields: ['to', 'subject', 'body'] },
        { id: 'send_slack', name: 'Send Slack Message', category: 'notification', fields: ['channel', 'message'] },
        { id: 'send_sms', name: 'Send SMS', category: 'notification', fields: ['phone', 'message'] },
        { id: 'create_task', name: 'Create Task', category: 'tasks', fields: ['title', 'assignee', 'due_date'] },
        { id: 'update_record', name: 'Update Record', category: 'data', fields: ['table', 'id', 'fields'] },
        { id: 'create_record', name: 'Create Record', category: 'data', fields: ['table', 'fields'] },
        { id: 'http_request', name: 'HTTP Request', category: 'external', fields: ['url', 'method', 'headers', 'body'] },
        { id: 'delay', name: 'Delay', category: 'flow', fields: ['duration', 'unit'] },
        { id: 'condition', name: 'Condition', category: 'flow', fields: ['field', 'operator', 'value'] },
        { id: 'approval', name: 'Request Approval', category: 'approval', fields: ['approvers', 'message'] }
      ];

      return NextResponse.json({ actions });
    }

    // Default: return summary
    const [workflowCount, activeCount, executionCount] = await Promise.all([
      supabase.from('saga_instances').select('id', { count: 'exact', head: true }),
      supabase.from('saga_instances').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('workflow_executions').select('id', { count: 'exact', head: true })
    ]);

    return NextResponse.json({
      summary: {
        total_workflows: workflowCount.count || 0,
        active_workflows: activeCount.count || 0,
        total_executions: executionCount.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workflow data' }, { status: 500 });
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

    const body = await request.json();
    const validatedData = workflowActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      // Create a new workflow
      const { name, description, triggers, actions: workflowActions } = validatedData;

      // Create workflow
      const { data: workflow, error: wfError } = await supabase
        .from('saga_instances')
        .insert({
          name,
          description,
          status: 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (wfError) {
        return NextResponse.json({ error: wfError.message }, { status: 500 });
      }

      // Create triggers
      if (triggers && triggers.length > 0) {
        const triggerRecords = triggers.map((t: TriggerInput, i: number) => ({
          workflow_id: workflow.id,
          trigger_type: t.type,
          config: t.config || {},
          order: i
        }));

        await supabase.from('workflow_triggers').insert(triggerRecords);
      }

      // Create actions
      if (workflowActions && workflowActions.length > 0) {
        const actionRecords = workflowActions.map((a: ActionInput, i: number) => ({
          workflow_id: workflow.id,
          action_type: a.type,
          config: a.config || {},
          order: i
        }));

        await supabase.from('workflow_actions').insert(actionRecords);
      }

      return NextResponse.json({ workflow }, { status: 201 });
    }

    if (action === 'update') {
      // Update workflow
      const { workflow_id, name, description, status, triggers, actions: workflowActions } = body;

      const { data: workflow, error } = await supabase
        .from('saga_instances')
        .update({
          name,
          description,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      // Update triggers if provided
      if (triggers) {
        await supabase.from('workflow_triggers').delete().eq('workflow_id', workflow_id);
        const triggerRecords = triggers.map((t: TriggerInput, i: number) => ({
          workflow_id,
          trigger_type: t.type,
          config: t.config || {},
          order: i
        }));
        await supabase.from('workflow_triggers').insert(triggerRecords);
      }

      // Update actions if provided
      if (workflowActions) {
        await supabase.from('workflow_actions').delete().eq('workflow_id', workflow_id);
        const actionRecords = workflowActions.map((a: ActionInput, i: number) => ({
          workflow_id,
          action_type: a.type,
          config: a.config || {},
          order: i
        }));
        await supabase.from('workflow_actions').insert(actionRecords);
      }

      return NextResponse.json({ workflow });
    }

    if (action === 'activate') {
      const { workflow_id } = body;

      const { data, error } = await supabase
        .from('saga_instances')
        .update({ status: 'active', activated_at: new Date().toISOString() })
        .eq('id', workflow_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ workflow: data });
    }

    if (action === 'deactivate') {
      const { workflow_id } = body;

      const { data, error } = await supabase
        .from('saga_instances')
        .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
        .eq('id', workflow_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ workflow: data });
    }

    if (action === 'execute') {
      // Manually execute a workflow
      const { workflow_id, trigger_data } = body;

      // Get workflow
      const { data: workflow } = await supabase
        .from('saga_instances')
        .select(`*, actions:workflow_actions(*)`)
        .eq('id', workflow_id)
        .single();

      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }

      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id,
          status: 'running',
          trigger_data: trigger_data || {},
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (execError) {
        return NextResponse.json({ error: execError.message }, { status: 500 });
      }

      // Execute actions (simplified - in production would be async with proper error handling)
      const results: unknown[] = [];
      for (const wfAction of workflow.actions || []) {
        const stepResult = {
          action_id: wfAction.id,
          action_type: wfAction.action_type,
          status: 'completed',
          output: { message: `Executed ${wfAction.action_type}` },
          executed_at: new Date().toISOString()
        };

        await supabase.from('workflow_execution_steps').insert({
          execution_id: execution.id,
          ...stepResult
        });

        results.push(stepResult);
      }

      // Update execution status
      await supabase
        .from('workflow_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result: { steps: results }
        })
        .eq('id', execution.id);

      return NextResponse.json({
        execution: {
          ...execution,
          status: 'completed',
          steps: results
        }
      });
    }

    if (action === 'delete') {
      const { workflow_id } = body;

      // Get execution IDs first
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('id')
        .eq('workflow_id', workflow_id);

      interface ExecutionRecord { id: string }
      const executionIds = ((executions || []) as ExecutionRecord[]).map((e: ExecutionRecord) => e.id);

      // Delete related records
      if (executionIds.length > 0) {
        await supabase.from('workflow_execution_steps').delete().in('execution_id', executionIds);
      }
      await supabase.from('workflow_executions').delete().eq('workflow_id', workflow_id);
      await supabase.from('workflow_triggers').delete().eq('workflow_id', workflow_id);
      await supabase.from('workflow_actions').delete().eq('workflow_id', workflow_id);
      await supabase.from('saga_instances').delete().eq('id', workflow_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'duplicate') {
      const { workflow_id, new_name } = body;

      // Get original workflow
      const { data: original } = await supabase
        .from('saga_instances')
        .select(`*, triggers:workflow_triggers(*), actions:workflow_actions(*)`)
        .eq('id', workflow_id)
        .single();

      if (!original) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }

      // Create copy
      const { data: copy, error } = await supabase
        .from('saga_instances')
        .insert({
          name: new_name || `${original.name} (Copy)`,
          description: original.description,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      // Copy triggers
      if (original.triggers?.length > 0) {
        const triggers = original.triggers.map((t: Record<string, unknown>) => ({
          workflow_id: copy.id,
          trigger_type: t.trigger_type,
          config: t.config,
          order: t.order
        }));
        await supabase.from('workflow_triggers').insert(triggers);
      }

      // Copy actions
      if (original.actions?.length > 0) {
        const actions = original.actions.map((a: Record<string, unknown>) => ({
          workflow_id: copy.id,
          action_type: a.action_type,
          config: a.config,
          order: a.order
        }));
        await supabase.from('workflow_actions').insert(actions);
      }

      return NextResponse.json({ workflow: copy }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process workflow' }, { status: 500 });
  }
}
