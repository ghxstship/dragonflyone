export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createRateCardSchema = z.object({
  vendor_id: z.string().uuid().optional(),
  freelancer_id: z.string().uuid().optional(),
  service_type: z.string(),
  rate_type: z.string(),
  rate: z.number(),
  currency: z.string().optional(),
  minimum_hours: z.number().optional(),
  notes: z.string().optional(),
});

const updateRateCardSchema = z.object({
  id: z.string().uuid(),
  rate: z.number().optional(),
  notes: z.string().optional(),
});

// Rate cards and pricing information
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
    const vendorId = searchParams.get('vendor_id');
    const freelancerId = searchParams.get('freelancer_id');
    const serviceType = searchParams.get('service_type');

    let query = supabase.from('rate_cards').select('*');

    if (vendorId) query = query.eq('vendor_id', vendorId);
    if (freelancerId) query = query.eq('freelancer_id', freelancerId);
    if (serviceType) query = query.eq('service_type', serviceType);

    const { data, error } = await query.order('service_type', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ rate_cards: data });
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
    const validatedData = createRateCardSchema.parse(body);
    const { vendor_id, freelancer_id, service_type, rate_type, rate, currency, minimum_hours, notes } = validatedData;

    const { data, error } = await supabase.from('rate_cards').insert({
      vendor_id, freelancer_id, service_type, rate_type,
      rate, currency: currency || 'USD', minimum_hours, notes
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ rate_card: data }, { status: 201 });
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
    const validatedData = updateRateCardSchema.parse(body);
    const { id, rate, notes } = validatedData;

    await supabase.from('rate_cards').update({ rate, notes, updated_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
