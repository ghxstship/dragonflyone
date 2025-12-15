export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const dataSourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['Database', 'API', 'File', 'Streaming']),
  sync_frequency: z.string().optional().default('Daily'),
  connection_string: z.string().optional(),
  organization_id: z.string().uuid('Invalid organization ID'),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type');
      const status = searchParams.get('status');
      const orgId = searchParams.get('organization_id');

      let query = supabase
        .from('data_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (orgId) query = query.eq('organization_id', orgId);
      if (type) query = query.eq('type', type);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data: data || [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch data sources';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'data_sources:list', resource: 'data_sources' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await request.json();
      const validation = dataSourceSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('data_sources')
        .insert({ ...validation.data, status: 'Disconnected', record_count: 0 })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create data source';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'data_sources:create', resource: 'data_sources' },
  }
);
