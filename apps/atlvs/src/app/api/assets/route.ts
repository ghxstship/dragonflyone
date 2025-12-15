export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const createAssetSchema = z.object({
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  tag: z.string().min(1),
  category: z.string().min(1),
  state: z.enum(['available', 'reserved', 'deployed', 'maintenance', 'retired']).default('available'),
  purchase_price: z.number().optional(),
  acquired_at: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const orgId = searchParams.get('organization_id');
    const category = searchParams.get('category');
    const state = searchParams.get('state');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    let query = supabase
      .from('assets')
      .select('*, projects(*)', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('tag', { ascending: true })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }
    if (state) {
      query = query.eq('state', state);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ 
      assets: data, 
      total: count,
      limit,
      offset
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createAssetSchema.parse(body);

    const { data, error } = await supabase
      .from('assets')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Asset tag already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ asset: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    logger.error('Error in POST /api/assets:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
