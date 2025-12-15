export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const clientRetentionSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  segment: z.string().min(1, 'Segment is required'),
  total_revenue: z.number().optional().default(0),
  total_deals: z.number().optional().default(0),
  avg_deal_size: z.number().optional().default(0),
  first_deal_date: z.string().optional(),
  last_deal_date: z.string().optional(),
  days_since_last_deal: z.number().optional().default(0),
  health_score: z.number().min(0).max(100).optional().default(50),
  nps_score: z.number().optional(),
  status: z.enum(['Active', 'At Risk', 'Churned', 'New']).optional().default('New'),
  organization_id: z.string().uuid('Invalid organization ID'),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const segment = searchParams.get('segment');
      const orgId = searchParams.get('organization_id');

      let query = supabase
        .from('client_retention')
        .select('*')
        .order('total_revenue', { ascending: false });

      if (orgId) {
        query = query.eq('organization_id', orgId);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (segment) {
        query = query.eq('segment', segment);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching client retention:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data: data || [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch client retention data';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'client_retention:list', resource: 'client_retention' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await request.json();

      const validation = clientRetentionSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.error.flatten() },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('client_retention')
        .insert(validation.data)
        .select()
        .single();

      if (error) {
        console.error('Error creating client retention record:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create client retention record';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'client_retention:create', resource: 'client_retention' },
  }
);
