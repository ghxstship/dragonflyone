import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('asset_request_permissions')
      .select('*', { count: 'exact' })
      .order('category')
      .order('subcategory')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    } else {
      query = query.eq('is_active', true);
    }

    const { data, error, count } = await query;

    if (error) {
      log.error('Failed to fetch asset request permissions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, limit, offset });
  } catch (error) {
    log.error('Unexpected error fetching asset request permissions:', error);
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

    if (!payload.organization_id || !payload.category) {
      return NextResponse.json(
        { error: 'organization_id and category are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('asset_request_permissions')
      .insert({
        organization_id: payload.organization_id,
        category: payload.category,
        subcategory: payload.subcategory,
        allowed_roles: payload.allowed_roles || ['COMPVSS_TEAM_MEMBER'],
        allowed_user_ids: payload.allowed_user_ids || [],
        denied_user_ids: payload.denied_user_ids || [],
        max_quantity: payload.max_quantity,
        max_value: payload.max_value,
        requires_justification: payload.requires_justification ?? false,
        justification_min_length: payload.justification_min_length ?? 0,
        auto_approve_below_value: payload.auto_approve_below_value,
        approval_chain: payload.approval_chain || [],
        escalation_after_hours: payload.escalation_after_hours ?? 48,
        request_window_start: payload.request_window_start,
        request_window_end: payload.request_window_end,
        blackout_dates: payload.blackout_dates || [],
        notes: payload.notes,
        created_by: payload.created_by,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Permission already exists for this category/subcategory' },
          { status: 409 }
        );
      }
      log.error('Failed to create asset request permission:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ permission: data }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating asset request permission:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
