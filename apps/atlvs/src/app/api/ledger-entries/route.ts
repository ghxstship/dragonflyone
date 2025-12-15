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

const createEntrySchema = z.object({
  organization_id: z.string().uuid(),
  account_id: z.string().uuid(),
  amount: z.number(),
  side: z.enum(['debit', 'credit']),
  entry_date: z.string(),
  project_id: z.string().uuid().optional(),
  memo: z.string().optional(),
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
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!orgId) return NextResponse.json({ error: 'organization_id required' }, { status: 400 });

    let query = supabase.from('ledger_entries').select('*, ledger_accounts(*)', { count: 'exact' })
      .eq('organization_id', orgId).order('entry_date', { ascending: false }).range(offset, offset + limit - 1);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ entries: data, total: count, limit, offset });
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
    const payload = createEntrySchema.parse(body);
    const { data, error } = await supabase.from('ledger_entries').insert(payload).select().single();
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    logger.error('Error in POST /api/ledger-entries:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
