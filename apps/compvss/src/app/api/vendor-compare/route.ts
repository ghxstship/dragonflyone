export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const saveComparisonSchema = z.object({
  vendor_ids: z.array(z.string().uuid()),
  project_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// Vendor comparison tools
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
    const vendorIds = searchParams.get('vendor_ids')?.split(',') || [];

    if (vendorIds.length < 2) {
      return NextResponse.json({ error: 'At least 2 vendors required for comparison' }, { status: 400 });
    }

    const { data: vendors } = await supabase.from('vendors').select(`
      *, ratings:vendor_ratings(rating),
      rate_cards:rate_cards(service_type, rate),
      certifications:vendor_certifications(name, verified)
    `).in('id', vendorIds);

    // Build comparison matrix
    interface RatingEntry { rating: number }
    interface RateCard { service_type: string; rate: number }
    interface VendorData { id: string; name: string; ratings?: RatingEntry[]; services?: string[]; certifications?: { verified?: boolean }[]; rate_cards?: RateCard[]; insurance_verified?: boolean; years_in_business?: number }
    const comparison = vendors?.map((v: VendorData) => ({
      id: v.id,
      name: v.name,
      avg_rating: v.ratings?.length ? v.ratings.reduce((s: number, r: RatingEntry) => s + r.rating, 0) / v.ratings.length : null,
      total_reviews: v.ratings?.length || 0,
      services: v.services || [],
      certifications: v.certifications?.filter((c: { verified?: boolean }) => c.verified).length || 0,
      rates: v.rate_cards?.reduce((acc: Record<string, number>, rc: RateCard) => {
        acc[rc.service_type] = rc.rate;
        return acc;
      }, {}) || {},
      insurance_verified: v.insurance_verified,
      years_in_business: v.years_in_business
    }));

    return NextResponse.json({ comparison });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to compare' }, { status: 500 });
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
    const validatedData = saveComparisonSchema.parse(body);
    const { vendor_ids, project_id, notes } = validatedData;

    // Save comparison for later reference
    const { data, error } = await supabase.from('vendor_comparisons').insert({
      vendor_ids, project_id, notes, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ comparison: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
