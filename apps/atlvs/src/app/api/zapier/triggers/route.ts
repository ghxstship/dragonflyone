import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WebhookSubscriptionSchema = z.object({
  trigger_type: z.enum([
    'new_deal',
    'deal_stage_change',
    'invoice_status_change',
    'payment_received',
    'new_contact',
    'crew_assignment',
    'ticket_sale',
    'guest_feedback',
    'asset_maintenance_alert',
    'project_status_change',
    'budget_variance_alert',
    'contract_expiring',
  ]),
  webhook_url: z.string().url(),
  filters: z.record(z.any()).optional(),
});

// GET /api/zapier/triggers - List available triggers and subscriptions
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

    if (action === 'list_triggers') {
      // Return available trigger types
      const triggers = [
        {
          key: 'new_deal',
          name: 'New Deal Created',
          description: 'Triggers when a new deal is created in the CRM',
          sample_data: {
            id: 'deal_123',
            name: 'Sample Deal',
            value: 50000,
            stage: 'proposal',
            contact_id: 'contact_456',
            created_at: new Date().toISOString(),
          },
        },
        {
          key: 'deal_stage_change',
          name: 'Deal Stage Changed',
          description: 'Triggers when a deal moves to a different stage',
          sample_data: {
            id: 'deal_123',
            name: 'Sample Deal',
            previous_stage: 'proposal',
            new_stage: 'negotiation',
            changed_at: new Date().toISOString(),
          },
        },
        {
          key: 'invoice_status_change',
          name: 'Invoice Status Changed',
          description: 'Triggers when an invoice status changes (sent, paid, overdue)',
          sample_data: {
            id: 'inv_123',
            invoice_number: 'INV-2024-001',
            previous_status: 'sent',
            new_status: 'paid',
            amount: 10000,
            changed_at: new Date().toISOString(),
          },
        },
        {
          key: 'payment_received',
          name: 'Payment Received',
          description: 'Triggers when a payment is received',
          sample_data: {
            id: 'pay_123',
            amount: 5000,
            invoice_id: 'inv_123',
            payment_method: 'credit_card',
            received_at: new Date().toISOString(),
          },
        },
        {
          key: 'new_contact',
          name: 'New Contact Created',
          description: 'Triggers when a new contact is added',
          sample_data: {
            id: 'contact_123',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            company: 'Acme Corp',
            created_at: new Date().toISOString(),
          },
        },
        {
          key: 'crew_assignment',
          name: 'Crew Member Assigned',
          description: 'Triggers when a crew member is assigned to a project',
          sample_data: {
            id: 'assignment_123',
            crew_member_id: 'crew_456',
            project_id: 'project_789',
            role: 'Stage Manager',
            start_date: new Date().toISOString(),
          },
        },
        {
          key: 'ticket_sale',
          name: 'Ticket Sold',
          description: 'Triggers when a ticket is purchased',
          sample_data: {
            id: 'ticket_123',
            event_id: 'event_456',
            ticket_type: 'VIP',
            quantity: 2,
            total_amount: 250,
            purchased_at: new Date().toISOString(),
          },
        },
        {
          key: 'guest_feedback',
          name: 'Guest Feedback Received',
          description: 'Triggers when a guest submits feedback or review',
          sample_data: {
            id: 'feedback_123',
            event_id: 'event_456',
            rating: 5,
            comment: 'Great event!',
            submitted_at: new Date().toISOString(),
          },
        },
        {
          key: 'asset_maintenance_alert',
          name: 'Asset Maintenance Alert',
          description: 'Triggers when an asset requires maintenance',
          sample_data: {
            id: 'alert_123',
            asset_id: 'asset_456',
            asset_name: 'Sound Console',
            alert_type: 'scheduled_maintenance',
            due_date: new Date().toISOString(),
          },
        },
        {
          key: 'project_status_change',
          name: 'Project Status Changed',
          description: 'Triggers when a project status changes',
          sample_data: {
            id: 'project_123',
            name: 'Summer Festival',
            previous_status: 'planning',
            new_status: 'active',
            changed_at: new Date().toISOString(),
          },
        },
        {
          key: 'budget_variance_alert',
          name: 'Budget Variance Alert',
          description: 'Triggers when budget variance exceeds threshold',
          sample_data: {
            id: 'alert_123',
            project_id: 'project_456',
            budget: 100000,
            actual: 115000,
            variance_percent: 15,
            triggered_at: new Date().toISOString(),
          },
        },
        {
          key: 'contract_expiring',
          name: 'Contract Expiring Soon',
          description: 'Triggers when a contract is about to expire',
          sample_data: {
            id: 'contract_123',
            vendor_id: 'vendor_456',
            vendor_name: 'Equipment Rental Co',
            expiration_date: new Date().toISOString(),
            days_until_expiry: 30,
          },
        },
      ];

      return NextResponse.json({ triggers });
    } else {
      // Get user's webhook subscriptions
      const { data: subscriptions, error } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ subscriptions: subscriptions || [] });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch triggers' }, { status: 500 });
  }
}

// POST /api/zapier/triggers - Subscribe to a trigger
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
    const validated = WebhookSubscriptionSchema.parse(body);

    // Create subscription
    const { data: subscription, error } = await supabase
      .from('webhook_subscriptions')
      .insert({
        user_id: user.id,
        trigger_type: validated.trigger_type,
        webhook_url: validated.webhook_url,
        filters: validated.filters,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

// DELETE /api/zapier/triggers - Unsubscribe from a trigger
export async function DELETE(request: NextRequest) {
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
    const subscriptionId = searchParams.get('subscription_id');

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('webhook_subscriptions')
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .eq('id', subscriptionId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
