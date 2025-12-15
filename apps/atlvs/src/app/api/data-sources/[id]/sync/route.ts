export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const POST = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const params = context.params as { id: string };
      const { id } = params;

      const { data, error } = await supabase
        .from('data_sources')
        .update({ status: 'Syncing', last_sync: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Simulate sync completion
      setTimeout(async () => {
        await supabase.from('data_sources').update({ status: 'Connected' }).eq('id', id);
      }, 2000);

      return NextResponse.json({ data, message: 'Sync initiated' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'data_sources:sync', resource: 'data_sources' },
  }
);
