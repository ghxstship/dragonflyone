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

const createAccountSchema = z.object({
  organization_id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  account_type: z.string().min(1),
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = (page - 1) * limit;

    if (!orgId) return NextResponse.json({ error: 'organization_id required' }, { status: 400 });

    const { data, error, count } = await supabase
      .from('ledger_accounts')
      .select('id, code, name, account_type, is_active, balance, created_at', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('code')
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    const totalCount = count || (data?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (data?.length ?? 0) < totalCount,
    };

    return NextResponse.json({ accounts: data, pagination });
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
    const payload = createAccountSchema.parse(body);
    const { data, error } = await supabase.from('ledger_accounts').insert(payload).select().single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Account code already exists' }, { status: 409 });
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
    return NextResponse.json({ account: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    logger.error('Error in POST /api/ledger-accounts:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
