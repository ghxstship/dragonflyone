export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const updateSchema = z.object({
  maintenance_type: z.enum(['Preventive', 'Corrective', 'Emergency', 'Inspection']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Overdue']).optional(),
  scheduled_date: z.string().optional(),
  completed_date: z.string().optional(),
  description: z.string().optional(),
  actual_cost: z.number().optional(),
  labor_hours: z.number().optional(),
  notes: z.string().optional(),
});

export const PATCH = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const params = context.params as { id: string };
      const { id } = params;
      const body = await request.json();
      
      const validation = updateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: 'Validation failed', details: validation.error.flatten() }, { status: 400 });
      }
      
      const { data, error } = await supabase
        .from('maintenance_records')
        .update({ ...validation.data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER],
    rateLimit: { maxRequests: 50, windowMs: 60000 },
    audit: { action: 'maintenance:update', resource: 'maintenance_records' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: Record<string, unknown>) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const params = context.params as { id: string };
      const { id } = params;
      
      const { error } = await supabase.from('maintenance_records').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
  {
    auth: true,
    roles: [PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_SUPER_ADMIN],
    rateLimit: { maxRequests: 30, windowMs: 60000 },
    audit: { action: 'maintenance:delete', resource: 'maintenance_records' },
  }
);
