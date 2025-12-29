import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createCatalogItemSchema = z.object({
  organization_id: z.string().uuid().optional(),
  item_id: z.string().min(1),
  item_name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  base_price_low: z.number().optional(),
  base_price_high: z.number().optional(),
  standard_unit: z.string().optional(),
  industry_verticals: z.array(z.string()).optional(),
  procurement_type: z.string().optional(),
  custom_fields: z.record(z.unknown()).optional(),
  internal_notes: z.string().optional(),
  preferred_vendors: z.array(z.string()).optional(),
  is_locked: z.boolean().optional(),
  is_preferred: z.boolean().optional(),
  created_by: z.string().uuid().optional(),
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/catalog/organization
 * List organization-specific catalog items with filtering
 */
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await request.json();
    const validatedData = createCatalogItemSchema.parse(payload);

    const { data, error } = await supabase
      .from('organization_catalog_items')
      .insert({
        organization_id: validatedData.organization_id,
        item_id: validatedData.item_id,
        item_name: validatedData.item_name,
        description: validatedData.description,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        base_price_low: validatedData.base_price_low,
        base_price_high: validatedData.base_price_high,
        standard_unit: validatedData.standard_unit || 'Per Unit',
        industry_verticals: validatedData.industry_verticals || ['universal'],
        procurement_type: validatedData.procurement_type || 'purchase',
        custom_fields: validatedData.custom_fields || {},
        internal_notes: validatedData.internal_notes,
        preferred_vendors: validatedData.preferred_vendors || [],
        is_locked: validatedData.is_locked || false,
        is_preferred: validatedData.is_preferred || false,
        enabled: true,
        created_by: validatedData.created_by,
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
