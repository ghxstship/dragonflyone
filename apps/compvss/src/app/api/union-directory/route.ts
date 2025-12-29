export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createUnionLocalSchema = z.object({
  union_name: z.string().min(1),
  local_number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  jurisdiction: z.string().optional(),
  contacts: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  })).optional(),
});

// Union local contacts and representatives
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
    const union = searchParams.get('union');
    const location = searchParams.get('location');

    let query = supabase.from('union_locals').select(`
      *, contacts:union_contacts(id, name, title, phone, email)
    `);

    if (union) query = query.ilike('union_name', `%${union}%`);
    if (location) query = query.or(`city.ilike.%${location}%,state.ilike.%${location}%`);

    const { data, error } = await query.order('union_name', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ unions: data });
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
    const validatedData = createUnionLocalSchema.parse(body);
    const { union_name, local_number, city, state, phone, email, website, jurisdiction, contacts } = validatedData;

    const { data, error } = await supabase.from('union_locals').insert({
      union_name, local_number, city, state, phone, email, website, jurisdiction
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    if (contacts?.length) {
      await supabase.from('union_contacts').insert(
        contacts.map((c: Record<string, unknown>) => ({ local_id: data.id, name: c.name, title: c.title, phone: c.phone, email: c.email }))
      );
    }

    return NextResponse.json({ union: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
