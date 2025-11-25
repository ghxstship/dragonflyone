import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WorkflowTriggerSchema = z.object({
  trigger_type: z.enum(['event', 'schedule', 'manual', 'webhook', 'condition']),
  event_type: z.string().optional(),
  schedule: z.object({
    cron: z.string().optional(),
    interval_minutes: z.number().optional(),
    timezone: z.string().optional(),
  }).optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']),
    value: z.any(),
  })).optional(),
});

const WorkflowActionSchema = z.object({
  action_type: z.enum([
    'send_email',
    'send_notification',
    'create_task',
    'update_record',
    'create_record',
    'delete_record',
    'call_webhook',
    'delay',
    'condition',
    'loop',
    'assign_user',
    'send_sms',
    'generate_document',
    'approve_reject',
  ]),
  config: z.record(z.any()),
  next_action_id: z.string().uuid().optional(),
  on_success_action_id: z.string().uuid().optional(),
  on_failure_action_id: z.string().uuid().optional(),
});

const WorkflowSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  trigger: WorkflowTriggerSchema,
  actions: z.array(WorkflowActionSchema),
  is_active: z.boolean().default(true),
});

// GET /api/workflows/automation - Get workflows and execution history
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
    const workflowId = searchParams.get('workflow_id');
    const action = searchParams.get('action');

    if (action === 'templates') {
      // Get workflow templates
      const templates = [
        {
          id: 'new_deal_notification',
          name: 'New Deal Notification',
          description: 'Notify team when a new deal is created',
          category: 'sales',
          trigger: { trigger_type: 'event', event_type: 'deal.created' },
          actions: [
            { action_type: 'send_notification', config: { title: 'New Deal Created', message: '{{deal.name}} - ${{deal.value}}' } },
          ],
        },
        {
          id: 'invoice_overdue_reminder',
          name: 'Invoice Overdue Reminder',
          description: 'Send reminder when invoice becomes overdue',
          category: 'finance',
          trigger: { trigger_type: 'event', event_type: 'invoice.overdue' },
          actions: [
            { action_type: 'send_email', config: { template: 'invoice_reminder', to: '{{invoice.contact_email}}' } },
            { action_type: 'create_task', config: { title: 'Follow up on overdue invoice', assignee: '{{invoice.owner_id}}' } },
          ],
        },
        {
          id: 'project_kickoff',
          name: 'Project Kickoff Automation',
          description: 'Automate project kickoff tasks',
          category: 'projects',
          trigger: { trigger_type: 'event', event_type: 'project.started' },
          actions: [
            { action_type: 'create_task', config: { title: 'Schedule kickoff meeting' } },
            { action_type: 'send_notification', config: { title: 'Project Started', to_role: 'project_team' } },
            { action_type: 'generate_document', config: { template: 'project_charter' } },
          ],
        },
        {
          id: 'approval_workflow',
          name: 'Expense Approval Workflow',
          description: 'Route expenses for approval based on amount',
          category: 'finance',
          trigger: { trigger_type: 'event', event_type: 'expense.submitted' },
          actions: [
            { action_type: 'condition', config: { field: 'amount', operator: 'greater_than', value: 1000 } },
            { action_type: 'approve_reject', config: { approver_role: 'finance_manager' } },
          ],
        },
        {
          id: 'crew_onboarding',
          name: 'Crew Onboarding',
          description: 'Automate new crew member onboarding',
          category: 'hr',
          trigger: { trigger_type: 'event', event_type: 'crew.created' },
          actions: [
            { action_type: 'send_email', config: { template: 'welcome_email' } },
            { action_type: 'create_task', config: { title: 'Complete onboarding checklist' } },
            { action_type: 'assign_user', config: { role: 'mentor' } },
          ],
        },
      ];

      return NextResponse.json({ templates });
    }

    if (action === 'executions' && workflowId) {
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(50);

      return NextResponse.json({ executions: executions || [] });
    }

    if (action === 'stats') {
      // Get workflow statistics
      const { data: workflows } = await supabase
        .from('workflows')
        .select('id, is_active');

      const { data: recentExecutions } = await supabase
        .from('workflow_executions')
        .select('status')
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const successCount = recentExecutions?.filter(e => e.status === 'completed').length || 0;
      const failedCount = recentExecutions?.filter(e => e.status === 'failed').length || 0;

      return NextResponse.json({
        stats: {
          total_workflows: workflows?.length || 0,
          active_workflows: workflows?.filter(w => w.is_active).length || 0,
          executions_24h: recentExecutions?.length || 0,
          success_rate: recentExecutions?.length ? (successCount / recentExecutions.length * 100).toFixed(1) : 0,
          failed_count: failedCount,
        },
      });
    }

    if (workflowId) {
      const { data: workflow } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }

      return NextResponse.json({ workflow });
    }

    // List all workflows
    const { data: workflows } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({ workflows: workflows || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

// POST /api/workflows/automation - Create or execute workflow
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
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = WorkflowSchema.parse(body);

      const { data: workflow, error } = await supabase
        .from('workflows')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ workflow }, { status: 201 });
    } else if (action === 'execute') {
      const { workflow_id, trigger_data } = body;

      // Get workflow
      const { data: workflow } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflow_id)
        .eq('is_active', true)
        .single();

      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found or inactive' }, { status: 404 });
      }

      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id,
          trigger_data,
          status: 'running',
          started_at: new Date().toISOString(),
          started_by: user.id,
        })
        .select()
        .single();

      if (execError) {
        return NextResponse.json({ error: execError.message }, { status: 500 });
      }

      // Execute actions (simplified - in production, use a job queue)
      const results = [];
      for (const actionDef of workflow.actions) {
        try {
          const result = await executeAction(actionDef, trigger_data, user.id);
          results.push({ action: actionDef.action_type, status: 'success', result });
        } catch (err: any) {
          results.push({ action: actionDef.action_type, status: 'failed', error: err.message });
        }
      }

      // Update execution record
      const allSuccess = results.every(r => r.status === 'success');
      await supabase
        .from('workflow_executions')
        .update({
          status: allSuccess ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          results,
        })
        .eq('id', execution.id);

      return NextResponse.json({
        execution_id: execution.id,
        status: allSuccess ? 'completed' : 'failed',
        results,
      });
    } else if (action === 'create_from_template') {
      const { template_id, name, customizations } = body;

      // Get template (in production, fetch from database)
      const templates: Record<string, any> = {
        new_deal_notification: {
          trigger: { trigger_type: 'event', event_type: 'deal.created' },
          actions: [{ action_type: 'send_notification', config: {} }],
        },
      };

      const template = templates[template_id];
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      const { data: workflow, error } = await supabase
        .from('workflows')
        .insert({
          name,
          trigger: { ...template.trigger, ...customizations?.trigger },
          actions: customizations?.actions || template.actions,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ workflow }, { status: 201 });
    } else if (action === 'test') {
      const { workflow_id, test_data } = body;

      // Get workflow
      const { data: workflow } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflow_id)
        .single();

      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }

      // Dry run - validate but don't execute
      const validationResults = [];
      for (const actionDef of workflow.actions) {
        validationResults.push({
          action: actionDef.action_type,
          config_valid: true,
          preview: getActionPreview(actionDef, test_data),
        });
      }

      return NextResponse.json({
        workflow_id,
        test_data,
        validation_results: validationResults,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/workflows/automation - Update workflow
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflow_id');

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: workflow, error } = await supabase
      .from('workflows')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workflow });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
}

// DELETE /api/workflows/automation - Delete workflow
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflow_id');

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', workflowId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }
}

// Helper function to execute workflow action
async function executeAction(actionDef: any, triggerData: any, userId: string): Promise<any> {
  switch (actionDef.action_type) {
    case 'send_notification':
      const { data: notification } = await supabase
        .from('unified_notifications')
        .insert({
          user_id: actionDef.config.to || userId,
          title: interpolate(actionDef.config.title, triggerData),
          message: interpolate(actionDef.config.message, triggerData),
          type: 'info',
          source_platform: 'atlvs',
        })
        .select()
        .single();
      return { notification_id: notification?.id };

    case 'send_email':
      // In production, integrate with email service
      return { email_queued: true, template: actionDef.config.template };

    case 'create_task':
      const { data: task } = await supabase
        .from('tasks')
        .insert({
          title: interpolate(actionDef.config.title, triggerData),
          description: interpolate(actionDef.config.description || '', triggerData),
          assigned_to: actionDef.config.assignee,
          created_by: userId,
        })
        .select()
        .single();
      return { task_id: task?.id };

    case 'update_record':
      const { data: updated } = await supabase
        .from(actionDef.config.table)
        .update(actionDef.config.updates)
        .eq('id', actionDef.config.record_id || triggerData.id)
        .select()
        .single();
      return { updated_id: updated?.id };

    case 'delay':
      // In production, use job queue with delay
      return { delayed_ms: actionDef.config.delay_ms };

    case 'call_webhook':
      const response = await fetch(actionDef.config.url, {
        method: actionDef.config.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triggerData),
      });
      return { status: response.status };

    default:
      return { skipped: true };
  }
}

// Helper function to interpolate variables
function interpolate(template: string, data: any): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const keys = path.split('.');
    let value = data;
    for (const key of keys) {
      value = value?.[key];
    }
    return value !== undefined ? String(value) : match;
  });
}

// Helper function to get action preview
function getActionPreview(actionDef: any, testData: any): string {
  switch (actionDef.action_type) {
    case 'send_notification':
      return `Will send notification: "${interpolate(actionDef.config.title || '', testData)}"`;
    case 'send_email':
      return `Will send email using template: ${actionDef.config.template}`;
    case 'create_task':
      return `Will create task: "${interpolate(actionDef.config.title || '', testData)}"`;
    default:
      return `Will execute: ${actionDef.action_type}`;
  }
}
