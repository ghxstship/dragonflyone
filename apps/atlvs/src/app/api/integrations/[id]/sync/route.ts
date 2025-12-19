export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const syncSchema = z.object({
  entity_types: z.array(z.string()).optional(),
  direction: z.enum(['inbound', 'outbound', 'bidirectional']).default('bidirectional'),
  full_sync: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json().catch(() => ({}));
    const payload = syncSchema.parse(body);

    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    if (integration.status !== 'connected') {
      return NextResponse.json({ error: 'Integration is not connected' }, { status: 400 });
    }

    if (!integration.sync_enabled) {
      return NextResponse.json({ error: 'Sync is disabled for this integration' }, { status: 400 });
    }

    const { data: syncLog, error: logError } = await supabase
      .from('integration_sync_logs')
      .insert({
        integration_id: id,
        direction: payload.direction,
        entity_type: payload.entity_types?.join(',') || 'all',
        action: payload.full_sync ? 'full_sync' : 'incremental_sync',
        status: 'pending',
        request_data: {
          entity_types: payload.entity_types,
          full_sync: payload.full_sync,
          triggered_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    await supabase
      .from('integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({
      sync_started: true,
      sync_log_id: syncLog.id,
      message: `Sync initiated for ${integration.provider_display_name || integration.provider}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
