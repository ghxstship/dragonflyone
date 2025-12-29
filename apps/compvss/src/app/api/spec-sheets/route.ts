export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createSpecSheetSchema = z.object({
  name: z.string().min(1),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  specifications: z.record(z.unknown()).optional(),
  pdf_url: z.string().url().optional(),
  cad_url: z.string().url().optional(),
});

// Technical specification sheets and cut sheets
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
    const manufacturer = searchParams.get('manufacturer');
    const search = searchParams.get('search');

    let query = supabase.from('spec_sheets').select('*');

    if (category) query = query.eq('category', category);
    if (manufacturer) query = query.ilike('manufacturer', `%${manufacturer}%`);
    if (search) query = query.or(`name.ilike.%${search}%,model.ilike.%${search}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ spec_sheets: data });
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
    const validatedData = createSpecSheetSchema.parse(body);
    const { name, manufacturer, model, category, specifications, pdf_url, cad_url } = validatedData;

    const { data, error } = await supabase.from('spec_sheets').insert({
      name, manufacturer, model, category, specifications: specifications || {}, pdf_url, cad_url
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ spec_sheet: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
