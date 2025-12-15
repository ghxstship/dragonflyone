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

      const { data: original, error: fetchError } = await supabase
        .from('dashboard_configs')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      const { data, error } = await supabase
        .from('dashboard_configs')
        .insert({
          organization_id: original.organization_id,
          name: `${original.name} (Copy)`,
          description: original.description,
          widget_count: original.widget_count || 0,
          is_default: false,
          status: 'Draft',
          config: original.config,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to duplicate';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'dashboard_configs:duplicate', resource: 'dashboard_configs' },
  }
);
