// apps/atlvs/src/app/api/advancing/catalog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import type { IndustryVertical, ProcurementType } from '@ghxstship/config/types/advancing';

export const dynamic = 'force-dynamic';

/**
 * GET /api/advancing/catalog
 * Browse production advancing catalog items with filtering and search
 * Supports multi-industry universal catalog with enhanced filters
 */
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const industryVertical = searchParams.get('industry_vertical') as IndustryVertical | null;
    const procurementType = searchParams.get('procurement_type') as ProcurementType | null;
    const featured = searchParams.get('featured');
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('production_advancing_catalog')
      .select('*', { count: 'exact' })
      .eq('enabled', true)
      .order('category', { ascending: true })
      .order('subcategory', { ascending: true })
      .order('item_name', { ascending: true })
      .range(offset, offset + limit - 1);

    // Apply category filters
    if (category) {
      query = query.eq('category', category);
    }

    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    // Industry vertical filter (array contains)
    if (industryVertical) {
      query = query.contains('industry_verticals', [industryVertical]);
    }

    // Procurement type filter
    if (procurementType) {
      query = query.eq('procurement_type', procurementType);
    }

    // Featured items filter
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Price range filters
    if (priceMin) {
      query = query.gte('base_price_low', parseFloat(priceMin));
    }

    if (priceMax) {
      query = query.lte('base_price_high', parseFloat(priceMax));
    }

    // Full-text search on item_name or search_keywords
    if (search) {
      // Use ilike for flexible search across name and keywords
      query = query.or(
        `item_name.ilike.%${search}%,search_keywords.cs.{${search.toLowerCase()}}`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching catalog:', error);
      return NextResponse.json(
        { error: 'Failed to fetch catalog items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
