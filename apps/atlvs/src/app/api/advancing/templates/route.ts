import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const templateType = searchParams.get('template_type');
    const isGlobal = searchParams.get('is_global');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('advance_templates')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .order('name')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (templateType) {
      query = query.eq('template_type', templateType);
    }

    if (isGlobal !== null && isGlobal !== undefined) {
      query = query.eq('is_global', isGlobal === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      log.error('Failed to fetch advance templates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get item counts for each template
    const templatesWithCounts = await Promise.all(
      (data || []).map(async (template) => {
        const { count: itemCount } = await supabase
          .from('advance_template_items')
          .select('*', { count: 'exact', head: true })
          .eq('template_id', template.id);
        
        return {
          ...template,
          item_count: itemCount || 0,
        };
      })
    );

    return NextResponse.json({ data: templatesWithCounts, count, limit, offset });
  } catch (error) {
    log.error('Unexpected error fetching advance templates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const payload = await request.json();

    if (!payload.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const { data: template, error: templateError } = await supabase
      .from('advance_templates')
      .insert({
        organization_id: payload.organization_id,
        name: payload.name,
        description: payload.description,
        category: payload.category,
        template_type: payload.template_type || 'reorder',
        is_global: payload.is_global ?? false,
        is_active: true,
        tags: payload.tags || [],
        project_id: payload.project_id,
        team_id: payload.team_id,
        created_by: payload.created_by,
      })
      .select()
      .single();

    if (templateError) {
      log.error('Failed to create advance template:', templateError);
      return NextResponse.json({ error: templateError.message }, { status: 500 });
    }

    // Add items if provided
    if (payload.items && payload.items.length > 0) {
      const items = payload.items.map((item: Record<string, unknown>, index: number) => ({
        template_id: template.id,
        catalog_item_id: item.catalog_item_id,
        org_catalog_item_id: item.org_catalog_item_id,
        item_name: item.item_name,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        default_quantity: item.default_quantity || 1,
        unit: item.unit || 'Per Unit',
        estimated_unit_cost: item.estimated_unit_cost,
        is_required: item.is_required ?? false,
        notes: item.notes,
        display_order: index,
      }));

      const { error: itemsError } = await supabase
        .from('advance_template_items')
        .insert(items);

      if (itemsError) {
        await supabase.from('advance_templates').delete().eq('id', template.id);
        log.error('Failed to create template items:', itemsError);
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }

      const estimatedCost = items.reduce((sum: number, item: { default_quantity: number; estimated_unit_cost?: number }) => {
        return sum + ((item.default_quantity || 1) * (item.estimated_unit_cost || 0));
      }, 0);

      if (estimatedCost > 0) {
        await supabase
          .from('advance_templates')
          .update({ estimated_cost: estimatedCost })
          .eq('id', template.id);
      }
    }

    const { data: completeTemplate } = await supabase
      .from('advance_templates')
      .select('*')
      .eq('id', template.id)
      .single();

    return NextResponse.json({ template: completeTemplate }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating advance template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
