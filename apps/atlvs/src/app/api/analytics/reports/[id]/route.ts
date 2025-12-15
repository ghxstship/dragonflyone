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
  type: z.enum(['financial', 'operational', 'hr', 'custom']).optional(),
  schedule: z.enum(['daily', 'weekly', 'monthly', 'on-demand']).optional(),
  format: z.enum(['pdf', 'excel', 'csv']).optional(),
  status: z.enum(['active', 'paused', 'error']).optional(),
});

export const GET = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const params = context.params as { id: string };
      const { id } = params;

      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch report';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'analytics_reports:read', resource: 'analytics_reports' },
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

      const updateData = {
        ...validation.data,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('analytics_reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update report';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'analytics_reports:update', resource: 'analytics_reports' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const params = context.params as { id: string };
      const { id } = params;

      const { error } = await supabase
        .from('analytics_reports')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete report';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'analytics_reports:delete', resource: 'analytics_reports' },
  }
);
