import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';
import crypto from 'crypto';

const ERPConnectionSchema = z.object({
  provider: z.enum(['netsuite', 'quickbooks', 'xero']),
  credentials: z.object({
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    realm_id: z.string().optional(),
    tenant_id: z.string().optional(),
    account_id: z.string().optional(),
  }),
  sync_settings: z.object({
    sync_gl: z.boolean().default(true),
    sync_ap: z.boolean().default(true),
    sync_ar: z.boolean().default(true),
    sync_currency: z.boolean().default(true),
    sync_tax: z.boolean().default(true),
    variance_threshold: z.number().default(1),
  }),
});

const GLExportSchema = z.object({
  connection_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  account_ids: z.array(z.string()).optional(),
  include_details: z.boolean().default(true),
});

// GET /api/integrations/erp-sync - Get ERP connections and sync status
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
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
    const connectionId = searchParams.get('connection_id');
    const action = searchParams.get('action');

    if (action === 'currency_rates') {
      // Get current currency rates
      const { data: rates } = await supabase
        .from('currency_rates')
        .select('*')
        .order('effective_date', { ascending: false });

      return NextResponse.json({ rates: rates || [] });
    }

    if (action === 'tax_tables') {
      // Get tax tables
      const { data: taxes } = await supabase
        .from('tax_rates')
        .select('*')
        .eq('is_active', true)
        .order('jurisdiction');

      return NextResponse.json({ taxes: taxes || [] });
    }

    if (action === 'reconciliation_status') {
      // Get recent reconciliation results
      const { data: reconciliations } = await supabase
        .from('erp_reconciliations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Check for variances exceeding threshold
      const alerts = reconciliations?.filter(r => 
        r.variance_percent > (r.threshold || 1)
      ) || [];

      return NextResponse.json({
        reconciliations: reconciliations || [],
        alerts,
        has_critical_variances: alerts.length > 0,
      });
    }

    if (connectionId) {
      // Get specific connection
      const { data: connection, error } = await supabase
        .from('erp_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Mask credentials
      if (connection.credentials) {
        connection.credentials = {
          ...connection.credentials,
          client_secret: connection.credentials.client_secret ? '***' : undefined,
          access_token: connection.credentials.access_token ? '***' : undefined,
          refresh_token: connection.credentials.refresh_token ? '***' : undefined,
        };
      }

      // Get recent sync logs
      const { data: syncLogs } = await supabase
        .from('erp_sync_logs')
        .select('*')
        .eq('connection_id', connectionId)
        .order('started_at', { ascending: false })
        .limit(10);

      return NextResponse.json({
        connection,
        sync_logs: syncLogs || [],
      });
    } else {
      // Get all connections
      const { data: connections, error } = await supabase
        .from('erp_connections')
        .select('id, provider, sync_settings, is_active, last_sync_at, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        connections: connections || [],
        providers: ['netsuite', 'quickbooks', 'xero'],
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ERP data' }, { status: 500 });
  }
}

// POST /api/integrations/erp-sync - Create connection or trigger sync
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
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
    const action = body.action || 'create_connection';

    if (action === 'create_connection') {
      const validated = ERPConnectionSchema.parse(body);

      const { data: connection, error } = await supabase
        .from('erp_connections')
        .insert({
          ...validated,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ connection }, { status: 201 });
    } else if (action === 'export_gl') {
      const validated = GLExportSchema.parse(body);

      // Create export job
      const { data: exportJob, error } = await supabase
        .from('gl_exports')
        .insert({
          connection_id: validated.connection_id,
          start_date: validated.start_date,
          end_date: validated.end_date,
          account_ids: validated.account_ids,
          include_details: validated.include_details,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get GL entries for export
      let glQuery = supabase
        .from('gl_entries')
        .select(`
          *,
          account:gl_accounts(account_number, account_name, account_type)
        `)
        .gte('transaction_date', validated.start_date)
        .lte('transaction_date', validated.end_date);

      if (validated.account_ids && validated.account_ids.length > 0) {
        glQuery = glQuery.in('account_id', validated.account_ids);
      }

      const { data: entries } = await glQuery;

      // Generate signed S3 manifest URL (simulated)
      const manifestUrl = `https://exports.ghxstship.com/gl/${exportJob.id}/manifest.json`;
      const signedUrl = `${manifestUrl}?signature=${generateSignature(exportJob.id)}&expires=${Date.now() + 3600000}`;

      // Update export job
      await supabase
        .from('gl_exports')
        .update({
          status: 'completed',
          record_count: entries?.length || 0,
          manifest_url: signedUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', exportJob.id);

      return NextResponse.json({
        export_id: exportJob.id,
        record_count: entries?.length || 0,
        manifest_url: signedUrl,
        entries: validated.include_details ? entries : undefined,
      });
    } else if (action === 'sync_currency') {
      const { connection_id, rates } = body;

      // Update currency rates
      const updates = rates.map((rate: any) => ({
        currency_code: rate.currency_code,
        base_currency: rate.base_currency || 'USD',
        rate: rate.rate,
        effective_date: rate.effective_date || new Date().toISOString().split('T')[0],
        source: 'erp_sync',
        connection_id,
      }));

      const { data: updatedRates, error } = await supabase
        .from('currency_rates')
        .upsert(updates, {
          onConflict: 'currency_code,base_currency,effective_date',
        })
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log sync
      await supabase.from('erp_sync_logs').insert({
        connection_id,
        sync_type: 'currency_update',
        status: 'completed',
        records_processed: updatedRates?.length || 0,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      return NextResponse.json({
        updated_count: updatedRates?.length || 0,
        rates: updatedRates,
      });
    } else if (action === 'sync_tax') {
      const { connection_id, tax_rates } = body;

      // Update tax rates
      const updates = tax_rates.map((tax: any) => ({
        jurisdiction: tax.jurisdiction,
        tax_type: tax.tax_type,
        rate: tax.rate,
        effective_date: tax.effective_date,
        expiration_date: tax.expiration_date,
        is_active: true,
        source: 'erp_sync',
        connection_id,
      }));

      const { data: updatedTaxes, error } = await supabase
        .from('tax_rates')
        .upsert(updates, {
          onConflict: 'jurisdiction,tax_type,effective_date',
        })
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log sync
      await supabase.from('erp_sync_logs').insert({
        connection_id,
        sync_type: 'tax_update',
        status: 'completed',
        records_processed: updatedTaxes?.length || 0,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      return NextResponse.json({
        updated_count: updatedTaxes?.length || 0,
        taxes: updatedTaxes,
      });
    } else if (action === 'reconcile') {
      const { connection_id, reconciliation_type, erp_data, atlvs_data } = body;

      // Calculate variance
      const erpTotal = erp_data.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      const atlvsTotal = atlvs_data.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      const variance = Math.abs(erpTotal - atlvsTotal);
      const variancePercent = atlvsTotal !== 0 ? (variance / atlvsTotal) * 100 : 0;

      // Get threshold from connection settings
      const { data: connection } = await supabase
        .from('erp_connections')
        .select('sync_settings')
        .eq('id', connection_id)
        .single();

      const threshold = connection?.sync_settings?.variance_threshold || 1;

      // Create reconciliation record
      const { data: reconciliation, error } = await supabase
        .from('erp_reconciliations')
        .insert({
          connection_id,
          reconciliation_type,
          erp_total: erpTotal,
          atlvs_total: atlvsTotal,
          variance_amount: variance,
          variance_percent: variancePercent,
          threshold,
          status: variancePercent > threshold ? 'variance_detected' : 'matched',
          erp_data,
          atlvs_data,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Send alert if variance exceeds threshold
      if (variancePercent > threshold) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'erp_variance_alert',
          title: 'ERP Reconciliation Variance Detected',
          message: `${reconciliation_type} variance of ${variancePercent.toFixed(2)}% exceeds threshold of ${threshold}%`,
          link: `/finance/reconciliation/${reconciliation.id}`,
          is_read: false,
        });
      }

      return NextResponse.json({
        reconciliation,
        has_variance: variancePercent > threshold,
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

// PATCH /api/integrations/erp-sync - Update connection
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connection_id');

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: connection, error } = await supabase
      .from('erp_connections')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ connection });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}

// Helper function
function generateSignature(id: string): string {
  const secret = process.env.EXPORT_SIGNING_SECRET || 'default-secret';
  return crypto.createHmac('sha256', secret).update(id).digest('hex').substring(0, 32);
}
