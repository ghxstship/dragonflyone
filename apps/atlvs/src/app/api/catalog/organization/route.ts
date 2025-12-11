import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/catalog/organization
 * List organization-specific catalog items with filtering
 */
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const isLocked = searchParams.get('is_locked');
    const isPreferred = searchParams.get('is_preferred');
    const enabled = searchParams.get('enabled');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('organization_catalog_items')
      .select('*', { count: 'exact' })
      .order('category')
      .order('item_name')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    if (search) {
      query = query.or(`item_name.ilike.%${search}%,item_id.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (isLocked !== null && isLocked !== undefined) {
      query = query.eq('is_locked', isLocked === 'true');
    }

    if (isPreferred !== null && isPreferred !== undefined) {
      query = query.eq('is_preferred', isPreferred === 'true');
    }

    if (enabled !== null && enabled !== undefined) {
      query = query.eq('enabled', enabled === 'true');
    } else {
      query = query.eq('enabled', true);
    }

    const { data, error, count } = await query;

    if (error) {
      log.error('Failed to fetch organization catalog items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, limit, offset });
  } catch (error) {
    log.error('Unexpected error fetching organization catalog:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/catalog/organization
 * Create a new organization-specific catalog item
 */
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const payload = await request.json();

    if (!payload.item_id || !payload.item_name || !payload.category) {
      return NextResponse.json(
        { error: 'item_id, item_name, and category are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('organization_catalog_items')
      .insert({
        organization_id: payload.organization_id,
        item_id: payload.item_id,
        item_name: payload.item_name,
        description: payload.description,
        category: payload.category,
        subcategory: payload.subcategory,
        base_price_low: payload.base_price_low,
        base_price_high: payload.base_price_high,
        standard_unit: payload.standard_unit || 'Per Unit',
        industry_verticals: payload.industry_verticals || ['universal'],
        procurement_type: payload.procurement_type || 'purchase',
        custom_fields: payload.custom_fields || {},
        internal_notes: payload.internal_notes,
        preferred_vendors: payload.preferred_vendors || [],
        is_locked: payload.is_locked || false,
        is_preferred: payload.is_preferred || false,
        enabled: true,
        created_by: payload.created_by,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Item with this ID already exists for this organization' },
          { status: 409 }
        );
      }
      log.error('Failed to create organization catalog item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating organization catalog item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
