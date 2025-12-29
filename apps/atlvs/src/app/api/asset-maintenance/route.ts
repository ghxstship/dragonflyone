export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createMaintenanceSchema = z.object({
  asset_id: z.string().uuid(),
  maintenance_type: z.enum(['preventive', 'corrective', 'inspection', 'calibration']),
  scheduled_date: z.string(),
  description: z.string().optional(),
  vendor_id: z.string().uuid().optional(),
  estimated_cost: z.number().min(0).optional(),
  recurring: z.boolean().optional(),
  recurring_interval_days: z.number().min(1).optional(),
});

const completeMaintenanceSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('complete'),
  actual_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
  next_scheduled: z.string().optional(),
});

const updateMaintenanceSchema = z.object({
  id: z.string().uuid(),
  scheduled_date: z.string().optional(),
  description: z.string().optional(),
  vendor_id: z.string().uuid().optional(),
  estimated_cost: z.number().min(0).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
});

const maintenancePatchSchema = z.union([completeMaintenanceSchema, updateMaintenanceSchema]);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('asset_id');
    const status = searchParams.get('status');

    let query = supabase.from('asset_maintenance').select(`
      *, asset:assets(id, name, category, serial_number)
    `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('scheduled_date', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    const upcoming = data?.filter(m => 
      m.status === 'scheduled' && new Date(m.scheduled_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ) || [];

    return NextResponse.json({
      maintenance_records: data,
      upcoming_maintenance: upcoming,
      overdue: data?.filter(m => m.status === 'scheduled' && new Date(m.scheduled_date) < new Date()) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createMaintenanceSchema.parse(body);
    const { asset_id, maintenance_type, scheduled_date, description, vendor_id, estimated_cost, recurring, recurring_interval_days } = validatedData;

    const { data, error } = await supabase
      .from('asset_maintenance')
      .insert({
        asset_id, maintenance_type, scheduled_date, description, vendor_id,
        estimated_cost, recurring: recurring || false, recurring_interval_days,
        status: 'scheduled', created_by: user.id
      })
      .select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ maintenance: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to schedule maintenance' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = maintenancePatchSchema.parse(body);
    const { id } = validatedData;

    if ('action' in validatedData && validatedData.action === 'complete') {
      const { actual_cost, notes, next_scheduled } = validatedData as z.infer<typeof completeMaintenanceSchema>;
      await supabase.from('asset_maintenance').update({
        status: 'completed', completed_date: new Date().toISOString(),
        actual_cost, completion_notes: notes, completed_by: user.id
      }).eq('id', id);

      // Schedule next if recurring
      if (next_scheduled) {
        const { data: original } = await supabase.from('asset_maintenance').select('*').eq('id', id).single();
        if (original?.recurring) {
          await supabase.from('asset_maintenance').insert({
            ...original, id: undefined, scheduled_date: next_scheduled,
            status: 'scheduled', created_at: undefined
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    const updateData = validatedData as z.infer<typeof updateMaintenanceSchema>;
    const { id: updateId, ...updateFields } = updateData;
    const { error } = await supabase.from('asset_maintenance').update(updateFields).eq('id', updateId);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update maintenance' }, { status: 500 });
  }
}
