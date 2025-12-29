export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createAuthoritySchema = z.object({
  name: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  permit_types: z.array(z.string()).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  processing_time: z.string().optional(),
  contacts: z.array(z.object({
    name: z.string(),
    title: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  })).optional(),
});

// Permitting authority contacts by jurisdiction
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
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const permitType = searchParams.get('permit_type');

    let query = supabase.from('permit_authorities').select(`
      *, contacts:authority_contacts(id, name, title, phone, email)
    `);

    if (city) query = query.ilike('city', `%${city}%`);
    if (state) query = query.eq('state', state);
    if (permitType) query = query.contains('permit_types', [permitType]);

    const { data, error } = await query.order('state', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ authorities: data });
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
    const validatedData = createAuthoritySchema.parse(body);
    const { name, city, state, permit_types, phone, email, website, processing_time, contacts } = validatedData;

    const { data, error } = await supabase.from('permit_authorities').insert({
      name, city, state, permit_types: permit_types || [], phone, email, website, processing_time
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    if (contacts?.length) {
      await supabase.from('authority_contacts').insert(
        contacts.map((c: Record<string, unknown>) => ({ authority_id: data.id, ...c }))
      );
    }

    return NextResponse.json({ authority: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
