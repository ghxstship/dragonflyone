import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/make/modules - List available Make modules
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleType = searchParams.get('type');

    const modules = {
      http: [
        {
          name: 'ATLVS - Get Contacts',
          description: 'Retrieve contacts from ATLVS CRM',
          endpoint: '/api/contacts',
          method: 'GET',
          parameters: [
            { name: 'limit', type: 'number', default: 100, max: 10000 },
            { name: 'offset', type: 'number', default: 0 },
            { name: 'search', type: 'string', optional: true },
          ],
        },
        {
          name: 'ATLVS - Get Deals',
          description: 'Retrieve deals from ATLVS CRM',
          endpoint: '/api/deals',
          method: 'GET',
          parameters: [
            { name: 'limit', type: 'number', default: 100, max: 10000 },
            { name: 'stage', type: 'string', optional: true },
          ],
        },
        {
          name: 'ATLVS - Get Invoices',
          description: 'Retrieve invoices from ATLVS Finance',
          endpoint: '/api/invoices',
          method: 'GET',
          parameters: [
            { name: 'limit', type: 'number', default: 100, max: 10000 },
            { name: 'status', type: 'string', optional: true },
          ],
        },
        {
          name: 'COMPVSS - Get Projects',
          description: 'Retrieve projects from COMPVSS',
          endpoint: '/api/projects',
          method: 'GET',
          parameters: [
            { name: 'limit', type: 'number', default: 100, max: 10000 },
            { name: 'status', type: 'string', optional: true },
          ],
        },
        {
          name: 'COMPVSS - Get Crew',
          description: 'Retrieve crew members from COMPVSS',
          endpoint: '/api/crew',
          method: 'GET',
          parameters: [
            { name: 'limit', type: 'number', default: 100, max: 10000 },
            { name: 'skills', type: 'array', optional: true },
          ],
        },
        {
          name: 'GVTEWAY - Get Events',
          description: 'Retrieve events from GVTEWAY',
          endpoint: '/api/events',
          method: 'GET',
          parameters: [
            { name: 'limit', type: 'number', default: 100, max: 10000 },
            { name: 'status', type: 'string', optional: true },
          ],
        },
        {
          name: 'GVTEWAY - Get Tickets',
          description: 'Retrieve ticket sales from GVTEWAY',
          endpoint: '/api/tickets',
          method: 'GET',
          parameters: [
            { name: 'limit', type: 'number', default: 100, max: 10000 },
            { name: 'event_id', type: 'string', optional: true },
          ],
        },
      ],
      webhooks: [
        {
          name: 'ATLVS - Deal Created',
          description: 'Triggered when a new deal is created',
          event: 'deal.created',
        },
        {
          name: 'ATLVS - Invoice Paid',
          description: 'Triggered when an invoice is paid',
          event: 'invoice.paid',
        },
        {
          name: 'COMPVSS - Project Started',
          description: 'Triggered when a project starts',
          event: 'project.started',
        },
        {
          name: 'COMPVSS - Crew Assigned',
          description: 'Triggered when crew is assigned to a project',
          event: 'crew.assigned',
        },
        {
          name: 'GVTEWAY - Ticket Sold',
          description: 'Triggered when a ticket is sold',
          event: 'ticket.sold',
        },
        {
          name: 'GVTEWAY - Event Sold Out',
          description: 'Triggered when an event sells out',
          event: 'event.sold_out',
        },
      ],
      data_stores: [
        {
          name: 'Contact Sync Store',
          description: 'Store for syncing contacts between systems',
          schema: {
            id: 'string',
            email: 'string',
            first_name: 'string',
            last_name: 'string',
            company: 'string',
            last_synced: 'datetime',
          },
        },
        {
          name: 'Deal Pipeline Store',
          description: 'Store for tracking deal pipeline changes',
          schema: {
            deal_id: 'string',
            stage: 'string',
            value: 'number',
            changed_at: 'datetime',
          },
        },
        {
          name: 'Event Inventory Store',
          description: 'Store for tracking event ticket inventory',
          schema: {
            event_id: 'string',
            ticket_type: 'string',
            available: 'number',
            sold: 'number',
            updated_at: 'datetime',
          },
        },
      ],
      scenario_templates: [
        {
          name: 'Finance Ops - Invoice to ERP',
          description: 'Sync paid invoices to your ERP system',
          category: 'finance',
          triggers: ['invoice.paid'],
          actions: ['erp.create_journal_entry', 'slack.notify'],
        },
        {
          name: 'Production Ops - Crew Scheduling',
          description: 'Automate crew scheduling and notifications',
          category: 'production',
          triggers: ['project.started'],
          actions: ['crew.check_availability', 'crew.assign', 'email.send'],
        },
        {
          name: 'Guest Marketing - Post-Event Follow-up',
          description: 'Send follow-up emails after events',
          category: 'marketing',
          triggers: ['event.completed'],
          actions: ['mailchimp.add_to_list', 'email.send_survey'],
        },
      ],
    };

    if (moduleType && modules[moduleType as keyof typeof modules]) {
      return NextResponse.json({ modules: modules[moduleType as keyof typeof modules] });
    }

    return NextResponse.json({
      modules,
      rate_limits: {
        requests_per_minute: 60,
        bulk_limit: 10000,
        recommended_batch_size: 500,
      },
      scheduling_windows: {
        recommended: 'Off-peak hours (2AM-6AM local time)',
        avoid: 'Business hours for large syncs',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
  }
}

// POST /api/make/modules - Execute module action or register webhook
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify HMAC signature for webhooks
    const signature = request.headers.get('x-make-signature');
    const timestamp = request.headers.get('x-make-timestamp');
    
    if (signature && timestamp) {
      const body = await request.text();
      const isValid = verifyHmacSignature(body, timestamp, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, module_name, parameters } = body;

    if (action === 'register_webhook') {
      const { event_type, webhook_url } = body;

      const { data: webhook, error } = await supabase
        .from('make_webhooks')
        .insert({
          user_id: user.id,
          event_type,
          webhook_url,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ webhook }, { status: 201 });
    } else if (action === 'bulk_fetch') {
      const { endpoint, limit, cursor } = parameters;

      // Implement iterator-friendly bulk fetch
      const pageSize = Math.min(limit || 500, 10000);
      
      // This would fetch from the appropriate endpoint
      // For now, return pagination info
      return NextResponse.json({
        data: [],
        pagination: {
          limit: pageSize,
          cursor,
          has_more: false,
          next_cursor: null,
        },
        rate_limit: {
          remaining: 59,
          reset_at: new Date(Date.now() + 60000).toISOString(),
        },
      });
    } else if (action === 'execute_scenario') {
      const { scenario_id, input_data } = body;

      // Log scenario execution
      await supabase.from('make_scenario_logs').insert({
        user_id: user.id,
        scenario_id,
        input_data,
        status: 'started',
        started_at: new Date().toISOString(),
      });

      return NextResponse.json({
        execution_id: crypto.randomUUID(),
        status: 'started',
        message: 'Scenario execution started',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to verify HMAC signature
function verifyHmacSignature(body: string, timestamp: string, signature: string): boolean {
  const secret = process.env.MAKE_WEBHOOK_SECRET || 'default-secret';
  const data = `${timestamp}.${body}`;
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
