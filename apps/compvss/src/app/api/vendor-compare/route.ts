import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Vendor comparison tools
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
    const comparison = vendors?.map(v => ({
      id: v.id,
      name: v.name,
      avg_rating: v.ratings?.length ? v.ratings.reduce((s: number, r: any) => s + r.rating, 0) / v.ratings.length : null,
      total_reviews: v.ratings?.length || 0,
      services: v.services || [],
      certifications: v.certifications?.filter((c: any) => c.verified).length || 0,
      rates: v.rate_cards?.reduce((acc: any, rc: any) => {
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
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { vendor_ids, project_id, notes } = body;

    // Save comparison for later reference
    const { data, error } = await supabase.from('vendor_comparisons').insert({
      vendor_ids, project_id, notes, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ comparison: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
