import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const revenueSyncSchema = z.object({
  order_id: z.string().uuid(),
  force_sync: z.boolean().default(false),
});

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = context.validated;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, events(*, source_project_id)')
        .eq('id', payload.order_id)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (!order.events?.source_project_id) {
        return NextResponse.json({ error: 'Order event not linked to project' }, { status: 400 });
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('organization_id')
        .eq('id', order.events.source_project_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Source project not found' }, { status: 404 });
      }

      const { data: ledgerAccount, error: accountError } = await supabase
        .from('ledger_accounts')
        .select('id')
        .eq('organization_id', project.organization_id)
        .eq('account_type', 'revenue')
        .eq('name', 'Event Ticket Sales')
        .single();

      if (accountError) {
        return NextResponse.json({ error: 'Revenue account not found' }, { status: 404 });
      }

      const { data: ledgerEntry, error: entryError } = await supabase
        .from('ledger_entries')
        .insert({
          organization_id: project.organization_id,
          ledger_account_id: ledgerAccount.id,
          amount: order.total_amount,
          entry_type: 'revenue',
          posted_date: new Date().toISOString(),
          description: `Revenue from order ${order.id}`,
          source_order_id: order.id,
          created_by: context.user?.id,
        })
        .select()
        .single();

      if (entryError) {
        return NextResponse.json({ error: entryError.message }, { status: 500 });
      }

      await supabase
        .from('integration_logs')
        .insert({
          source_platform: 'gvteway',
          target_platform: 'atlvs',
          workflow_type: 'revenue_ingestion',
          source_id: order.id,
          target_id: ledgerEntry.id,
          status: 'success',
          user_id: context.user?.id,
        });

      await supabase
        .from('orders')
        .update({ revenue_synced: true, revenue_sync_date: new Date().toISOString() })
        .eq('id', order.id);

      return NextResponse.json({ 
        success: true,
        ledger_entry: ledgerEntry,
        message: 'Revenue successfully synced to ATLVS'
      }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Revenue sync failed' }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    validation: revenueSyncSchema,
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'order:revenue_sync', resource: 'orders' },
  }
);
