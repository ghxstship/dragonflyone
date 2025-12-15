export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  visibility: z.enum(['private', 'team', 'organization']).optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const params = context.params as { id: string };
      const { id } = params;

      const { data, error } = await supabase
        .from('analytics_dashboards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Increment view count
      await supabase
        .from('analytics_dashboards')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);

      return NextResponse.json({ data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'analytics_dashboards:read', resource: 'analytics_dashboards' },
  }
);

export const PATCH = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const params = context.params as { id: string };
      const { id } = params;
      const body = await request.json();

      const validation = updateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten() },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('analytics_dashboards')
        .update({ ...validation.data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update dashboard';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'analytics_dashboards:update', resource: 'analytics_dashboards' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const params = context.params as { id: string };
      const { id } = params;

      const { error } = await supabase
        .from('analytics_dashboards')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete dashboard';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'analytics_dashboards:delete', resource: 'analytics_dashboards' },
  }
);
