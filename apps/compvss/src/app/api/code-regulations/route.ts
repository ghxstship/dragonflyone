export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createRegulationSchema = z.object({
  title: z.string(),
  code_number: z.string().optional(),
  category: z.string(),
  jurisdiction: z.string().optional(),
  description: z.string().optional(),
  effective_date: z.string().optional(),
  document_url: z.string().optional(),
});

// Code and regulation references
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
    const category = searchParams.get('category');
    const jurisdiction = searchParams.get('jurisdiction');
    const search = searchParams.get('search');

    let query = supabase.from('code_regulations').select('*');

    if (category) query = query.eq('category', category);
    if (jurisdiction) query = query.eq('jurisdiction', jurisdiction);
    if (search) query = query.or(`title.ilike.%${search}%,code_number.ilike.%${search}%`);

    const { data, error } = await query.order('category', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Group by category
    interface Regulation { id: string; category: string; title: string }
    const byCategory: Record<string, Regulation[]> = {};
    data?.forEach((r: Regulation) => {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r);
    });

    return NextResponse.json({ regulations: data, by_category: byCategory });
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
    const validatedData = createRegulationSchema.parse(body);
    const { title, code_number, category, jurisdiction, description, effective_date, document_url } = validatedData;

    const { data, error } = await supabase.from('code_regulations').insert({
      title, code_number, category, jurisdiction, description, effective_date, document_url
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ regulation: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
