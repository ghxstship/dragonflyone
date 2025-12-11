import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const scopeType = searchParams.get('scope_type');
    const scopeId = searchParams.get('scope_id');
    const targetType = searchParams.get('target_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('catalog_visibility_settings')
      .select('*', { count: 'exact' })
      .order('scope_type')
      .order('target_type')
      .range(offset, offset + limit - 1);

    if (scopeType) {
      query = query.eq('scope_type', scopeType);
    }

    if (scopeId) {
      query = query.eq('scope_id', scopeId);
    }

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    const { data, error, count } = await query;

    if (error) {
      log.error('Failed to fetch catalog visibility settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, limit, offset });
  } catch (error) {
    log.error('Unexpected error fetching catalog visibility settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const payload = await request.json();

    if (!payload.organization_id || !payload.scope_type || !payload.target_type || !payload.target_value) {
      return NextResponse.json(
        { error: 'organization_id, scope_type, target_type, and target_value are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('catalog_visibility_settings')
      .insert({
        organization_id: payload.organization_id,
        scope_type: payload.scope_type,
        scope_id: payload.scope_id,
        target_type: payload.target_type,
        target_value: payload.target_value,
        is_visible: payload.is_visible ?? true,
        is_requestable: payload.is_requestable ?? true,
        requires_approval: payload.requires_approval ?? false,
        approval_role: payload.approval_role,
        max_quantity_per_request: payload.max_quantity_per_request,
        max_value_per_request: payload.max_value_per_request,
        budget_period: payload.budget_period,
        budget_limit: payload.budget_limit,
        notes: payload.notes,
        created_by: payload.created_by,
      })
      .select()
      .single();

    if (error) {
      log.error('Failed to create catalog visibility setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ setting: data }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating catalog visibility setting:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
