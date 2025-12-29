export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createAssessmentSchema = z.object({
  project_id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  description: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  photo_urls: z.array(z.string().url()).optional(),
  estimated_cost: z.number().min(0).optional(),
});

const resolveSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('resolve'),
  repair_cost: z.number().min(0).optional(),
  repair_notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'in_progress', 'resolved', 'deferred']),
});

const assessmentPatchSchema = z.union([resolveSchema, updateStatusSchema]);

// Damage assessment with photo evidence
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const equipmentId = searchParams.get('equipment_id');

    let query = supabase.from('damage_assessments').select(`
      *, equipment:equipment(id, name, asset_tag),
      photos:damage_photos(id, url, caption),
      reported_by:platform_users(first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (equipmentId) query = query.eq('equipment_id', equipmentId);

    const { data, error } = await query.order('reported_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      assessments: data,
      summary: {
        total: data?.length || 0,
        pending: data?.filter(a => a.status === 'pending').length || 0,
        total_cost: data?.reduce((s, a) => s + (a.repair_cost || 0), 0) || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createAssessmentSchema.parse(body);
    const { project_id, equipment_id, description, severity, photo_urls, estimated_cost } = validatedData;

    const { data: assessment, error } = await supabase.from('damage_assessments').insert({
      project_id, equipment_id, description, severity,
      estimated_cost, status: 'pending',
      reported_by: user.id, reported_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Add photos
    if (photo_urls?.length) {
      const photoRecords = photo_urls.map((url: string) => ({
        assessment_id: assessment.id, url
      }));
      await supabase.from('damage_photos').insert(photoRecords);
    }

    // Update equipment status
    await supabase.from('equipment').update({ condition: 'damaged' }).eq('id', equipment_id);

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = assessmentPatchSchema.parse(body);
    const { id } = validatedData;

    if ('action' in validatedData && validatedData.action === 'resolve') {
      const { repair_cost, repair_notes } = validatedData as z.infer<typeof resolveSchema>;
      await supabase.from('damage_assessments').update({
        status: 'resolved', repair_cost, repair_notes,
        resolved_at: new Date().toISOString()
      }).eq('id', id);

      // Update equipment condition
      const { data: assessment } = await supabase.from('damage_assessments').select('equipment_id').eq('id', id).single();
      if (assessment) {
        await supabase.from('equipment').update({ condition: 'good' }).eq('id', assessment.equipment_id);
      }

      return NextResponse.json({ success: true });
    }

    const { status } = validatedData as z.infer<typeof updateStatusSchema>;
    await supabase.from('damage_assessments').update({ status }).eq('id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
