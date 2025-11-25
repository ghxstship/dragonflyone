import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Action schemas
const CreateDealSchema = z.object({
  name: z.string(),
  value: z.number().optional(),
  stage: z.string().optional(),
  contact_id: z.string().uuid().optional(),
  expected_close_date: z.string().optional(),
  notes: z.string().optional(),
});

const UpdateDealSchema = z.object({
  deal_id: z.string().uuid(),
  name: z.string().optional(),
  value: z.number().optional(),
  stage: z.string().optional(),
  notes: z.string().optional(),
});

const LogPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_method: z.string(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

const CreateMilestoneSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string(),
  due_date: z.string(),
  description: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

const IssuePOSchema = z.object({
  vendor_id: z.string().uuid(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
  })),
  delivery_date: z.string().optional(),
  notes: z.string().optional(),
});

const CreateNotificationSchema = z.object({
  user_id: z.string().uuid().optional(),
  title: z.string(),
  message: z.string(),
  type: z.string().optional(),
  link: z.string().optional(),
});

const CreateServiceTicketSchema = z.object({
  asset_id: z.string().uuid(),
  issue_type: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

// GET /api/zapier/actions - List available actions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actions = [
      {
        key: 'create_deal',
        name: 'Create Deal',
        description: 'Create a new deal in the CRM',
        input_fields: [
          { key: 'name', label: 'Deal Name', type: 'string', required: true },
          { key: 'value', label: 'Deal Value', type: 'number', required: false },
          { key: 'stage', label: 'Stage', type: 'string', required: false },
          { key: 'contact_id', label: 'Contact ID', type: 'string', required: false },
          { key: 'expected_close_date', label: 'Expected Close Date', type: 'datetime', required: false },
          { key: 'notes', label: 'Notes', type: 'text', required: false },
        ],
      },
      {
        key: 'update_deal',
        name: 'Update Deal',
        description: 'Update an existing deal',
        input_fields: [
          { key: 'deal_id', label: 'Deal ID', type: 'string', required: true },
          { key: 'name', label: 'Deal Name', type: 'string', required: false },
          { key: 'value', label: 'Deal Value', type: 'number', required: false },
          { key: 'stage', label: 'Stage', type: 'string', required: false },
          { key: 'notes', label: 'Notes', type: 'text', required: false },
        ],
      },
      {
        key: 'log_payment',
        name: 'Log Payment',
        description: 'Record a payment against an invoice',
        input_fields: [
          { key: 'invoice_id', label: 'Invoice ID', type: 'string', required: true },
          { key: 'amount', label: 'Amount', type: 'number', required: true },
          { key: 'payment_method', label: 'Payment Method', type: 'string', required: true },
          { key: 'reference_number', label: 'Reference Number', type: 'string', required: false },
          { key: 'notes', label: 'Notes', type: 'text', required: false },
        ],
      },
      {
        key: 'create_milestone',
        name: 'Create Run-of-Show Milestone',
        description: 'Add a milestone to a project timeline',
        input_fields: [
          { key: 'project_id', label: 'Project ID', type: 'string', required: true },
          { key: 'name', label: 'Milestone Name', type: 'string', required: true },
          { key: 'due_date', label: 'Due Date', type: 'datetime', required: true },
          { key: 'description', label: 'Description', type: 'text', required: false },
          { key: 'assigned_to', label: 'Assigned To (User ID)', type: 'string', required: false },
        ],
      },
      {
        key: 'issue_po',
        name: 'Issue Purchase Order',
        description: 'Create a new purchase order for a vendor',
        input_fields: [
          { key: 'vendor_id', label: 'Vendor ID', type: 'string', required: true },
          { key: 'items', label: 'Line Items', type: 'array', required: true },
          { key: 'delivery_date', label: 'Delivery Date', type: 'datetime', required: false },
          { key: 'notes', label: 'Notes', type: 'text', required: false },
        ],
      },
      {
        key: 'create_notification',
        name: 'Create Guest Notification',
        description: 'Send a notification to a user or guest',
        input_fields: [
          { key: 'user_id', label: 'User ID (optional)', type: 'string', required: false },
          { key: 'title', label: 'Title', type: 'string', required: true },
          { key: 'message', label: 'Message', type: 'text', required: true },
          { key: 'type', label: 'Notification Type', type: 'string', required: false },
          { key: 'link', label: 'Link URL', type: 'string', required: false },
        ],
      },
      {
        key: 'create_service_ticket',
        name: 'Post Asset Service Ticket',
        description: 'Create a maintenance or service ticket for an asset',
        input_fields: [
          { key: 'asset_id', label: 'Asset ID', type: 'string', required: true },
          { key: 'issue_type', label: 'Issue Type', type: 'string', required: true },
          { key: 'description', label: 'Description', type: 'text', required: true },
          { key: 'priority', label: 'Priority', type: 'string', required: false },
        ],
      },
    ];

    return NextResponse.json({ actions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

// POST /api/zapier/actions - Execute an action
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
    const { action, data } = body;

    // Log the action for analytics
    await supabase.from('zapier_action_logs').insert({
      user_id: user.id,
      action_type: action,
      request_data: data,
      created_at: new Date().toISOString(),
    });

    switch (action) {
      case 'create_deal': {
        const validated = CreateDealSchema.parse(data);
        const { data: deal, error } = await supabase
          .from('deals')
          .insert({
            ...validated,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, deal });
      }

      case 'update_deal': {
        const validated = UpdateDealSchema.parse(data);
        const { deal_id, ...updateData } = validated;
        const { data: deal, error } = await supabase
          .from('deals')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', deal_id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, deal });
      }

      case 'log_payment': {
        const validated = LogPaymentSchema.parse(data);
        const { data: payment, error } = await supabase
          .from('payments')
          .insert({
            ...validated,
            status: 'completed',
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Update invoice status
        await supabase
          .from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', validated.invoice_id);

        return NextResponse.json({ success: true, payment });
      }

      case 'create_milestone': {
        const validated = CreateMilestoneSchema.parse(data);
        const { data: milestone, error } = await supabase
          .from('project_milestones')
          .insert({
            ...validated,
            status: 'pending',
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, milestone });
      }

      case 'issue_po': {
        const validated = IssuePOSchema.parse(data);
        
        // Calculate total
        const totalAmount = validated.items.reduce(
          (sum, item) => sum + item.quantity * item.unit_price,
          0
        );

        // Generate PO number
        const { data: lastPo } = await supabase
          .from('purchase_orders')
          .select('po_number')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const lastNumber = lastPo?.po_number ? parseInt(lastPo.po_number.replace('PO-', '')) : 0;
        const poNumber = `PO-${String(lastNumber + 1).padStart(6, '0')}`;

        const { data: po, error } = await supabase
          .from('purchase_orders')
          .insert({
            vendor_id: validated.vendor_id,
            po_number: poNumber,
            items: validated.items,
            total_amount: totalAmount,
            delivery_date: validated.delivery_date,
            notes: validated.notes,
            status: 'pending',
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, purchase_order: po });
      }

      case 'create_notification': {
        const validated = CreateNotificationSchema.parse(data);
        const { data: notification, error } = await supabase
          .from('notifications')
          .insert({
            user_id: validated.user_id || user.id,
            title: validated.title,
            message: validated.message,
            type: validated.type || 'general',
            link: validated.link,
            is_read: false,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, notification });
      }

      case 'create_service_ticket': {
        const validated = CreateServiceTicketSchema.parse(data);
        const { data: ticket, error } = await supabase
          .from('asset_service_tickets')
          .insert({
            ...validated,
            status: 'open',
            created_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, service_ticket: ticket });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to execute action' }, { status: 500 });
  }
}
