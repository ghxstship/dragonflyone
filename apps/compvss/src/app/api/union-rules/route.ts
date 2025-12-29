export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createUnionRuleSchema = z.object({
  local_id: z.string().uuid(),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  effective_date: z.string().optional(),
  expiration_date: z.string().optional(),
  document_url: z.string().url().optional(),
  key_provisions: z.array(z.string()).optional(),
});

// Union rules and agreements by local
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
    const unionLocal = searchParams.get('local');
    const category = searchParams.get('category');

    let query = supabase.from('union_rules').select(`
      *, local:union_locals(name, local_number, jurisdiction)
    `);

    if (unionLocal) query = query.eq('local_id', unionLocal);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('category', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ rules: data });
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

    const body = await request.json();
    const validatedData = createUnionRuleSchema.parse(body);
    const { local_id, category, title, description, effective_date, expiration_date, document_url, key_provisions } = validatedData;

    const { data, error } = await supabase.from('union_rules').insert({
      local_id, category, title, description, effective_date,
      expiration_date, document_url, key_provisions: key_provisions || []
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ rule: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
