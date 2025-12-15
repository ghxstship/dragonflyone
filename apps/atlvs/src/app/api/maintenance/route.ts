export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const maintenanceSchema = z.object({
  asset_id: z.string().uuid(),
  maintenance_type: z.enum(['Preventive', 'Corrective', 'Emergency', 'Inspection']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  scheduled_date: z.string(),
  description: z.string().min(1),
  technician_id: z.string().uuid().optional(),
  estimated_cost: z.number().optional(),
  notes: z.string().optional(),
  organization_id: z.string().uuid().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const type = searchParams.get('type');
      const priority = searchParams.get('priority');
      const assetId = searchParams.get('asset_id');

      let query = supabase
        .from('maintenance_records')
        .select('*, asset:assets(id, name, category)')
        .order('scheduled_date', { ascending: true });

      if (status) query = query.eq('status', status);
      if (type) query = query.eq('maintenance_type', type);
      if (priority) query = query.eq('priority', priority);
      if (assetId) query = query.eq('asset_id', assetId);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data: data || [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch maintenance records';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER],
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'maintenance:list', resource: 'maintenance_records' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await request.json();
      const validation = maintenanceSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert({ ...validation.data, status: 'Scheduled' })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create maintenance record';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'maintenance:create', resource: 'maintenance_records' },
  }
);
