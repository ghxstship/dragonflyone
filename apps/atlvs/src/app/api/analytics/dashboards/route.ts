export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const dashboardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  visibility: z.enum(['private', 'team', 'organization']).optional().default('private'),
  organization_id: z.string().uuid('Invalid organization ID'),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      const visibility = searchParams.get('visibility');
      const starred = searchParams.get('starred');
      const orgId = searchParams.get('organization_id');

      let query = supabase
        .from('analytics_dashboards')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgId) {
        query = query.eq('organization_id', orgId);
      }
      if (visibility) {
        query = query.eq('visibility', visibility);
      }
      if (starred === 'true') {
        query = query.eq('is_starred', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching analytics dashboards:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: data || [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboards';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'analytics_dashboards:list', resource: 'analytics_dashboards' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await request.json();

      const validation = dashboardSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten() },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('analytics_dashboards')
        .insert({
          ...validation.data,
          widget_count: 0,
          view_count: 0,
          is_starred: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating dashboard:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create dashboard';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'analytics_dashboards:create', resource: 'analytics_dashboards' },
  }
);
