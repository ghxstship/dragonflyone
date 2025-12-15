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

      // Update last_run timestamp
      const { data, error } = await supabase
        .from('analytics_reports')
        .update({ 
          last_run: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Calculate next run based on schedule
      if (data.schedule && data.schedule !== 'on-demand') {
        const nextRun = calculateNextRun(data.schedule);
        await supabase
          .from('analytics_reports')
          .update({ next_run: nextRun })
          .eq('id', id);
      }

      return NextResponse.json({ data, message: 'Report run initiated' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run report';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'analytics_reports:run', resource: 'analytics_reports' },
  }
);

function calculateNextRun(schedule: string): string {
  const now = new Date();
  switch (schedule) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now.toISOString();
}
