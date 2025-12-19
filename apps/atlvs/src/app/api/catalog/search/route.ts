import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const vendorId = searchParams.get('vendor_id');
    const sortBy = searchParams.get('sort_by') || 'relevance';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query for catalog items
    let catalogQuery = supabase
      .from('catalog_items')
      .select(`
        id,
        name,
        description,
        sku,
        category,
        subcategory,
        unit_price,
        unit,
        vendor_profile_id,
        vendor_profile:vendor_profiles(id, name, company_name, rating),
        tags,
        is_active,
        created_at
      `, { count: 'exact' })
      .eq('is_active', true);

    // Apply search filter
    if (query) {
      catalogQuery = catalogQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%,tags.cs.{${query}}`);
    }

    // Apply category filter
    if (category) {
      catalogQuery = catalogQuery.eq('category', category);
    }

    // Apply subcategory filter
    if (subcategory) {
      catalogQuery = catalogQuery.eq('subcategory', subcategory);
    }

    // Apply price range filters
    if (minPrice) {
      catalogQuery = catalogQuery.gte('unit_price', parseFloat(minPrice));
    }
    if (maxPrice) {
      catalogQuery = catalogQuery.lte('unit_price', parseFloat(maxPrice));
    }

    // Apply vendor filter
    if (vendorId) {
      catalogQuery = catalogQuery.eq('vendor_profile_id', vendorId);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        catalogQuery = catalogQuery.order('unit_price', { ascending: true });
        break;
      case 'price_desc':
        catalogQuery = catalogQuery.order('unit_price', { ascending: false });
        break;
      case 'name':
        catalogQuery = catalogQuery.order('name', { ascending: true });
        break;
      case 'newest':
        catalogQuery = catalogQuery.order('created_at', { ascending: false });
        break;
      case 'relevance':
      default:
        catalogQuery = catalogQuery.order('name', { ascending: true });
        break;
    }

    // Apply pagination
    catalogQuery = catalogQuery.range(offset, offset + limit - 1);

    const { data: items, error: itemsError, count } = await catalogQuery;

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to search catalog' },
        { status: 500 }
      );
    }

    // Get category counts for faceted search
    const { data: categoryCounts } = await supabase
      .from('catalog_items')
      .select('category')
      .eq('is_active', true);

    const facets: Record<string, number> = {};
    categoryCounts?.forEach((item) => {
      if (item.category) {
        facets[item.category] = (facets[item.category] || 0) + 1;
      }
    });

    // Get price range
    const { data: priceStats } = await supabase
      .from('catalog_items')
      .select('unit_price')
      .eq('is_active', true)
      .order('unit_price', { ascending: true });

    const prices = priceStats?.map((p) => p.unit_price).filter((p) => p !== null) || [];
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };

    return NextResponse.json({
      items: items || [],
      total: count || 0,
      pagination: {
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
      facets: {
        categories: facets,
        price_range: priceRange,
      },
      query,
      filters: {
        category,
        subcategory,
        min_price: minPrice,
        max_price: maxPrice,
        vendor_id: vendorId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
