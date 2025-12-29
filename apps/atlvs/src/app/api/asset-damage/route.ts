export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createDamageReportSchema = z.object({
  asset_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  damage_type: z.string(),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']),
  description: z.string(),
  photo_urls: z.array(z.string()).optional(),
  estimated_repair_cost: z.number().optional(),
});

const startRepairSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('start_repair'),
  repair_vendor: z.string().optional(),
});

const completeRepairSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('complete_repair'),
  actual_cost: z.number().optional(),
  repair_notes: z.string().optional(),
});

const patchDamageReportSchema = z.union([
  startRepairSchema,
  completeRepairSchema,
]);

// Damage reporting and repair tracking
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

    let query = supabase.from('asset_damage_reports').select(`
      *, asset:assets(id, name, category), reported_by:platform_users!reported_by(id, first_name, last_name)
    `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('reported_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      reports: data,
      pending_repairs: data?.filter(r => r.status === 'pending_repair') || [],
      stats: {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending_repair').length || 0,
        in_repair: data?.filter(r => r.status === 'in_repair').length || 0,
        completed: data?.filter(r => r.status === 'repaired').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
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
    const validatedData = createDamageReportSchema.parse(body);
    const { asset_id, project_id, damage_type, severity, description, photo_urls, estimated_repair_cost } = validatedData;

    const { data, error } = await supabase.from('asset_damage_reports').insert({
      asset_id, project_id, damage_type, severity, description,
      photo_urls: photo_urls || [], estimated_repair_cost,
      reported_by: user.id, reported_at: new Date().toISOString(), status: 'pending_review'
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Update asset status
    await supabase.from('assets').update({ status: 'damaged' }).eq('id', asset_id);

    return NextResponse.json({ report: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
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
    const validatedData = patchDamageReportSchema.parse(body);
    const { id, action } = validatedData;

    if (action === 'start_repair') {
      const { repair_vendor } = validatedData as z.infer<typeof startRepairSchema>;
      await supabase.from('asset_damage_reports').update({
        status: 'in_repair', repair_vendor, repair_started_at: new Date().toISOString()
      }).eq('id', id);
    } else if (action === 'complete_repair') {
      const { actual_cost, repair_notes } = validatedData as z.infer<typeof completeRepairSchema>;
      const { data: report } = await supabase.from('asset_damage_reports').select('asset_id').eq('id', id).single();
      
      await supabase.from('asset_damage_reports').update({
        status: 'repaired', actual_cost, repair_notes,
        repair_completed_at: new Date().toISOString(), repaired_by: user.id
      }).eq('id', id);

      await supabase.from('assets').update({ status: 'available' }).eq('id', report?.asset_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
