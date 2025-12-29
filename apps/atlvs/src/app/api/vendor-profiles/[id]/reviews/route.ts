export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createReviewSchema = z.object({
  organization_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
  overall_rating: z.number().min(1).max(5),
  category_ratings: z.record(z.number().min(1).max(5)).optional(),
  review_text: z.string().optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  would_recommend: z.boolean().default(true),
  is_public: z.boolean().default(true),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') || 'published';

    const { data, error } = await supabase
      .from('vendor_reviews')
      .select(`
        *,
        booking:bookings(id, booking_number, event_name, event_date)
      `)
      .eq('vendor_profile_id', id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stats = {
      total_reviews: data?.length || 0,
      average_rating: data?.length 
        ? data.reduce((sum, r) => sum + r.overall_rating, 0) / data.length 
        : 0,
      would_recommend_percent: data?.length
        ? (data.filter(r => r.would_recommend).length / data.length) * 100
        : 0,
      rating_distribution: [1, 2, 3, 4, 5].reduce((acc, rating) => {
        acc[rating] = data?.filter(r => r.overall_rating === rating).length || 0;
        return acc;
      }, {} as Record<number, number>),
    };

    return NextResponse.json({ reviews: data, stats });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createReviewSchema.parse(body);

    const { data: vendor } = await supabase
      .from('vendor_profiles')
      .select('id, rating_average, rating_count')
      .eq('id', id)
      .single();

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('vendor_reviews')
      .insert({
        ...payload,
        vendor_profile_id: id,
        status: 'published',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const newCount = vendor.rating_count + 1;
    const newAverage = ((vendor.rating_average * vendor.rating_count) + payload.overall_rating) / newCount;

    await supabase
      .from('vendor_profiles')
      .update({
        rating_average: Math.round(newAverage * 100) / 100,
        rating_count: newCount,
      })
      .eq('id', id);

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
