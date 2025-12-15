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

      // Get current starred status
      const { data: current, error: fetchError } = await supabase
        .from('analytics_dashboards')
        .select('is_starred')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        }
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      // Toggle starred status
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .update({ is_starred: !current.is_starred })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data, starred: data.is_starred });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle star';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'analytics_dashboards:star', resource: 'analytics_dashboards' },
  }
);
