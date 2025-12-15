export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const bulkSyncSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID required'),
});

export const POST = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await request.json();
      const validation = bulkSyncSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
      }
      const { error } = await supabase
        .from('data_sources')
        .update({ status: 'Syncing', last_sync: new Date().toISOString() })
        .in('id', validation.data.ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, syncing: validation.data.ids.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 10, windowMs: 60000 },
    audit: { action: 'data_sources:bulk_sync', resource: 'data_sources' },
  }
);
