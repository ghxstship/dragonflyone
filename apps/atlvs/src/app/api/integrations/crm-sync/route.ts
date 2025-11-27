import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const CRMConnectionSchema = z.object({
  provider: z.enum(['salesforce', 'hubspot', 'pipedrive']),
  credentials: z.object({
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    instance_url: z.string().optional(),
    api_key: z.string().optional(),
  }),
  sync_settings: z.object({
    sync_contacts: z.boolean().default(true),
    sync_companies: z.boolean().default(true),
    sync_deals: z.boolean().default(true),
    sync_direction: z.enum(['to_crm', 'from_crm', 'bidirectional']).default('bidirectional'),
    conflict_resolution: z.enum(['crm_wins', 'atlvs_wins', 'newest_wins']).default('newest_wins'),
  }),
});

const FieldMappingSchema = z.object({
  connection_id: z.string().uuid(),
  entity_type: z.enum(['contact', 'company', 'deal']),
  atlvs_field: z.string(),
  crm_field: z.string(),
  transform: z.string().optional(),
  is_required: z.boolean().default(false),
});

// GET /api/integrations/crm-sync - Get CRM connections and sync status
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

    if (action === 'sync_status') {
      // Get recent sync logs
      const { data: syncLogs } = await supabase
        .from('crm_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      // Get sync stats
      const { data: stats } = await supabase
        .from('crm_sync_logs')
        .select('status, records_synced')
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const totalSynced = stats?.reduce((sum, s) => sum + (s.records_synced || 0), 0) || 0;
      const successCount = stats?.filter(s => s.status === 'completed').length || 0;
      const failedCount = stats?.filter(s => s.status === 'failed').length || 0;

      return NextResponse.json({
        sync_logs: syncLogs || [],
        stats_24h: {
          total_records_synced: totalSynced,
          successful_syncs: successCount,
          failed_syncs: failedCount,
        },
      });
    }

    if (connectionId) {
      // Get specific connection with field mappings
      const { data: connection, error } = await supabase
        .from('crm_connections')
        .select(`
          *,
          field_mappings:crm_field_mappings(*)
        `)
        .eq('id', connectionId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Mask sensitive credentials
      if (connection.credentials) {
        connection.credentials = {
          ...connection.credentials,
          client_secret: connection.credentials.client_secret ? '***' : undefined,
          access_token: connection.credentials.access_token ? '***' : undefined,
          refresh_token: connection.credentials.refresh_token ? '***' : undefined,
          api_key: connection.credentials.api_key ? '***' : undefined,
        };
      }

      return NextResponse.json({ connection });
    } else {
      // Get all connections
      const { data: connections, error } = await supabase
        .from('crm_connections')
        .select('id, provider, sync_settings, is_active, last_sync_at, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get default field mappings for each provider
      const defaultMappings = {
        salesforce: {
          contact: [
            { atlvs_field: 'first_name', crm_field: 'FirstName' },
            { atlvs_field: 'last_name', crm_field: 'LastName' },
            { atlvs_field: 'email', crm_field: 'Email' },
            { atlvs_field: 'phone', crm_field: 'Phone' },
            { atlvs_field: 'company', crm_field: 'Account.Name' },
          ],
          deal: [
            { atlvs_field: 'name', crm_field: 'Name' },
            { atlvs_field: 'value', crm_field: 'Amount' },
            { atlvs_field: 'stage', crm_field: 'StageName' },
            { atlvs_field: 'expected_close_date', crm_field: 'CloseDate' },
          ],
        },
        hubspot: {
          contact: [
            { atlvs_field: 'first_name', crm_field: 'firstname' },
            { atlvs_field: 'last_name', crm_field: 'lastname' },
            { atlvs_field: 'email', crm_field: 'email' },
            { atlvs_field: 'phone', crm_field: 'phone' },
            { atlvs_field: 'company', crm_field: 'company' },
          ],
          deal: [
            { atlvs_field: 'name', crm_field: 'dealname' },
            { atlvs_field: 'value', crm_field: 'amount' },
            { atlvs_field: 'stage', crm_field: 'dealstage' },
            { atlvs_field: 'expected_close_date', crm_field: 'closedate' },
          ],
        },
        pipedrive: {
          contact: [
            { atlvs_field: 'first_name', crm_field: 'first_name' },
            { atlvs_field: 'last_name', crm_field: 'last_name' },
            { atlvs_field: 'email', crm_field: 'email' },
            { atlvs_field: 'phone', crm_field: 'phone' },
            { atlvs_field: 'company', crm_field: 'org_name' },
          ],
          deal: [
            { atlvs_field: 'name', crm_field: 'title' },
            { atlvs_field: 'value', crm_field: 'value' },
            { atlvs_field: 'stage', crm_field: 'stage_id' },
            { atlvs_field: 'expected_close_date', crm_field: 'expected_close_date' },
          ],
        },
      };

      return NextResponse.json({
        connections: connections || [],
        default_mappings: defaultMappings,
        providers: ['salesforce', 'hubspot', 'pipedrive'],
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CRM data' }, { status: 500 });
  }
}

// POST /api/integrations/crm-sync - Create connection or trigger sync
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
      const validated = CRMConnectionSchema.parse(body);

      const { data: connection, error } = await supabase
        .from('crm_connections')
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
    } else if (action === 'add_field_mapping') {
      const validated = FieldMappingSchema.parse(body);

      const { data: mapping, error } = await supabase
        .from('crm_field_mappings')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ mapping }, { status: 201 });
    } else if (action === 'trigger_sync') {
      const { connection_id, entity_types, direction } = body;

      // Create sync log
      const { data: syncLog, error: logError } = await supabase
        .from('crm_sync_logs')
        .insert({
          connection_id,
          entity_types: entity_types || ['contact', 'company', 'deal'],
          direction: direction || 'bidirectional',
          status: 'running',
          started_at: new Date().toISOString(),
          triggered_by: user.id,
        })
        .select()
        .single();

      if (logError) {
        return NextResponse.json({ error: logError.message }, { status: 500 });
      }

      // In production, this would trigger an async job
      // For now, simulate sync completion
      setTimeout(async () => {
        await supabase
          .from('crm_sync_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            records_synced: Math.floor(Math.random() * 100) + 10,
          })
          .eq('id', syncLog.id);
      }, 5000);

      return NextResponse.json({
        sync_id: syncLog.id,
        status: 'running',
        message: 'Sync started',
      });
    } else if (action === 'resolve_conflict') {
      const { conflict_id, resolution, resolved_data } = body;

      const { data: conflict, error } = await supabase
        .from('crm_sync_conflicts')
        .update({
          status: 'resolved',
          resolution,
          resolved_data,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', conflict_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ conflict });
    } else if (action === 'oauth_callback') {
      const { provider, code, state } = body;

      // In production, exchange code for tokens
      // This is a placeholder for OAuth flow completion
      return NextResponse.json({
        message: 'OAuth callback received',
        provider,
        state,
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

// PATCH /api/integrations/crm-sync - Update connection
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
      .from('crm_connections')
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

// DELETE /api/integrations/crm-sync - Delete connection
export async function DELETE(request: NextRequest) {
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

    // Soft delete
    const { error } = await supabase
      .from('crm_connections')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
}
