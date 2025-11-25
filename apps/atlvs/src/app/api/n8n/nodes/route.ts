import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CredentialSchema = z.object({
  credential_type: z.enum(['oauth2', 'api_key']),
  name: z.string(),
  scopes: z.array(z.string()).optional(),
  data: z.record(z.any()),
});

const WorkflowSchema = z.object({
  workflow_name: z.string(),
  workflow_type: z.enum([
    'asset_maintenance',
    'finance_reconciliation',
    'crew_onboarding',
    'ticket_escalation',
    'marketing_drip',
    'compliance_alerts',
    'inventory_sync',
    'vip_concierge',
    'custom',
  ]),
  trigger_type: z.enum(['webhook', 'polling', 'schedule']),
  trigger_config: z.record(z.any()).optional(),
});

// GET /api/n8n/nodes - Get n8n node definitions and workflows
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
    const action = searchParams.get('action');

    if (action === 'node_definitions') {
      // Return n8n node definitions
      const nodes = {
        trigger_nodes: [
          {
            name: 'GHXSTSHIP Trigger',
            description: 'Triggers workflow on GHXSTSHIP events',
            type: 'webhook',
            events: [
              'deal.created',
              'deal.stage_changed',
              'invoice.paid',
              'invoice.overdue',
              'project.started',
              'project.completed',
              'crew.assigned',
              'ticket.sold',
              'event.sold_out',
              'asset.maintenance_due',
              'contract.expiring',
            ],
            outputs: ['main'],
          },
          {
            name: 'GHXSTSHIP Poll',
            description: 'Polls GHXSTSHIP for new data',
            type: 'polling',
            resources: ['contacts', 'deals', 'invoices', 'projects', 'events', 'tickets', 'assets'],
            outputs: ['main'],
          },
        ],
        regular_nodes: [
          {
            name: 'GHXSTSHIP',
            description: 'Interact with GHXSTSHIP platforms',
            operations: {
              atlvs: [
                { name: 'Get Contact', method: 'GET', endpoint: '/api/contacts/:id' },
                { name: 'Create Contact', method: 'POST', endpoint: '/api/contacts' },
                { name: 'Update Contact', method: 'PATCH', endpoint: '/api/contacts/:id' },
                { name: 'Get Deal', method: 'GET', endpoint: '/api/deals/:id' },
                { name: 'Create Deal', method: 'POST', endpoint: '/api/deals' },
                { name: 'Update Deal', method: 'PATCH', endpoint: '/api/deals/:id' },
                { name: 'Get Invoice', method: 'GET', endpoint: '/api/invoices/:id' },
                { name: 'Create Invoice', method: 'POST', endpoint: '/api/invoices' },
                { name: 'Get Asset', method: 'GET', endpoint: '/api/assets/:id' },
                { name: 'Create Asset', method: 'POST', endpoint: '/api/assets' },
              ],
              compvss: [
                { name: 'Get Project', method: 'GET', endpoint: '/api/projects/:id' },
                { name: 'Create Project', method: 'POST', endpoint: '/api/projects' },
                { name: 'Get Crew', method: 'GET', endpoint: '/api/crew/:id' },
                { name: 'Assign Crew', method: 'POST', endpoint: '/api/crew/assign' },
                { name: 'Get Schedule', method: 'GET', endpoint: '/api/schedule/:id' },
              ],
              gvteway: [
                { name: 'Get Event', method: 'GET', endpoint: '/api/events/:id' },
                { name: 'Create Event', method: 'POST', endpoint: '/api/events' },
                { name: 'Get Tickets', method: 'GET', endpoint: '/api/tickets' },
                { name: 'Get Orders', method: 'GET', endpoint: '/api/orders' },
              ],
            },
          },
          {
            name: 'GHXSTSHIP Webhook Verify',
            description: 'Verify GHXSTSHIP webhook signatures',
            inputs: ['main'],
            outputs: ['main', 'invalid'],
          },
          {
            name: 'GHXSTSHIP Paginator',
            description: 'Handle pagination for bulk data fetches',
            inputs: ['main'],
            outputs: ['main', 'done'],
          },
        ],
        helper_nodes: [
          {
            name: 'Webhook Signature Verify',
            description: 'Verify HMAC signatures on incoming webhooks',
          },
          {
            name: 'Pagination Cursor',
            description: 'Handle cursor-based pagination for large datasets',
          },
        ],
      };

      return NextResponse.json({ nodes });
    }

    if (action === 'reference_workflows') {
      // Return reference workflow templates
      const workflows = [
        {
          name: 'Asset Maintenance Loop',
          type: 'asset_maintenance',
          description: 'Monitor assets and create maintenance tickets when due',
          trigger: { type: 'schedule', cron: '0 8 * * *' },
          steps: [
            'Poll assets with upcoming maintenance',
            'Create service tickets for due items',
            'Notify assigned technicians',
            'Update asset status',
          ],
        },
        {
          name: 'Finance Reconciliation',
          type: 'finance_reconciliation',
          description: 'Daily reconciliation between Stripe and ATLVS',
          trigger: { type: 'schedule', cron: '0 2 * * *' },
          steps: [
            'Fetch Stripe transactions',
            'Compare with ATLVS invoices',
            'Flag variances',
            'Send report to finance team',
          ],
        },
        {
          name: 'Crew Onboarding',
          type: 'crew_onboarding',
          description: 'Automate new crew member onboarding',
          trigger: { type: 'webhook', event: 'crew.created' },
          steps: [
            'Send welcome email',
            'Create training assignments',
            'Schedule orientation',
            'Add to communication channels',
          ],
        },
        {
          name: 'Ticket Escalation',
          type: 'ticket_escalation',
          description: 'Escalate support tickets based on SLA',
          trigger: { type: 'schedule', cron: '*/15 * * * *' },
          steps: [
            'Check open tickets',
            'Identify SLA breaches',
            'Escalate to manager',
            'Send notifications',
          ],
        },
        {
          name: 'Marketing Drip',
          type: 'marketing_drip',
          description: 'Automated marketing sequences for ticket buyers',
          trigger: { type: 'webhook', event: 'ticket.sold' },
          steps: [
            'Add to email list',
            'Send confirmation',
            'Schedule pre-event reminder',
            'Queue post-event follow-up',
          ],
        },
        {
          name: 'Compliance Alerts',
          type: 'compliance_alerts',
          description: 'Monitor and alert on compliance issues',
          trigger: { type: 'schedule', cron: '0 9 * * 1' },
          steps: [
            'Check expiring certifications',
            'Review insurance status',
            'Flag compliance gaps',
            'Notify responsible parties',
          ],
        },
        {
          name: 'Inventory Sync',
          type: 'inventory_sync',
          description: 'Sync inventory across platforms',
          trigger: { type: 'schedule', cron: '0 */4 * * *' },
          steps: [
            'Fetch ATLVS inventory',
            'Compare with GVTEWAY stock',
            'Update discrepancies',
            'Log sync results',
          ],
        },
        {
          name: 'VIP Concierge',
          type: 'vip_concierge',
          description: 'Automated VIP guest management',
          trigger: { type: 'webhook', event: 'ticket.sold' },
          steps: [
            'Check if VIP ticket',
            'Create VIP profile',
            'Send personalized welcome',
            'Assign concierge contact',
          ],
        },
      ];

      return NextResponse.json({ workflows });
    }

    if (action === 'credentials') {
      // Get user's n8n credentials
      const { data: credentials } = await supabase
        .from('n8n_credentials')
        .select('id, credential_type, name, scopes, is_active, created_at')
        .eq('user_id', user.id);

      return NextResponse.json({ credentials: credentials || [] });
    }

    if (action === 'workflows') {
      // Get user's registered workflows
      const { data: workflows } = await supabase
        .from('n8n_workflows')
        .select('*')
        .eq('user_id', user.id);

      return NextResponse.json({ workflows: workflows || [] });
    }

    // Default: return overview
    return NextResponse.json({
      package_name: '@ghxstship/n8n-nodes',
      version: '1.0.0',
      credential_types: ['oauth2', 'api_key'],
      platforms: ['atlvs', 'compvss', 'gvteway'],
      documentation_url: 'https://docs.ghxstship.com/integrations/n8n',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch n8n data' }, { status: 500 });
  }
}

// POST /api/n8n/nodes - Create credentials or register workflows
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
    const action = body.action || 'create_credential';

    if (action === 'create_credential') {
      const validated = CredentialSchema.parse(body);

      // Encrypt sensitive data
      const encryptedData = encryptCredentialData(validated.data);

      const { data: credential, error } = await supabase
        .from('n8n_credentials')
        .insert({
          user_id: user.id,
          credential_type: validated.credential_type,
          name: validated.name,
          scopes: validated.scopes,
          encrypted_data: encryptedData,
          is_active: true,
        })
        .select('id, credential_type, name, scopes, is_active, created_at')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ credential }, { status: 201 });
    } else if (action === 'register_workflow') {
      const validated = WorkflowSchema.parse(body);

      const { data: workflow, error } = await supabase
        .from('n8n_workflows')
        .insert({
          user_id: user.id,
          ...validated,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ workflow }, { status: 201 });
    } else if (action === 'verify_webhook') {
      const { payload, signature, timestamp } = body;

      const isValid = verifyWebhookSignature(payload, signature, timestamp);

      return NextResponse.json({ valid: isValid });
    } else if (action === 'log_execution') {
      const { workflow_id, execution_id, trigger_data, status } = body;

      const { data: log, error } = await supabase
        .from('n8n_execution_logs')
        .insert({
          workflow_id,
          execution_id,
          trigger_data,
          status,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update workflow stats
      await supabase
        .from('n8n_workflows')
        .update({
          last_executed_at: new Date().toISOString(),
          execution_count: supabase.rpc('increment_execution_count', { workflow_id }),
        })
        .eq('id', workflow_id);

      return NextResponse.json({ log });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/n8n/nodes - Update credential or workflow
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
    const credentialId = searchParams.get('credential_id');
    const workflowId = searchParams.get('workflow_id');

    const body = await request.json();

    if (credentialId) {
      const { data: credential, error } = await supabase
        .from('n8n_credentials')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', credentialId)
        .eq('user_id', user.id)
        .select('id, credential_type, name, scopes, is_active, created_at')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ credential });
    } else if (workflowId) {
      const { data: workflow, error } = await supabase
        .from('n8n_workflows')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflowId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ workflow });
    }

    return NextResponse.json({ error: 'Credential ID or Workflow ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// Helper functions
function encryptCredentialData(data: Record<string, any>): Record<string, any> {
  // In production, use proper encryption (e.g., AES-256-GCM)
  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY || 'default-key';
  const cipher = crypto.createCipher('aes-256-cbc', secret);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted };
}

function verifyWebhookSignature(payload: any, signature: string, timestamp: string): boolean {
  const secret = process.env.WEBHOOK_SECRET || 'default-secret';
  const data = `${timestamp}.${JSON.stringify(payload)}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  // Check timestamp is within 5 minutes
  const timestampMs = parseInt(timestamp);
  if (Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    return false;
  }

  return signature === expectedSignature;
}
