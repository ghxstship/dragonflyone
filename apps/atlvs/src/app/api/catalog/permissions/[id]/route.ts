import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const { data, error } = await supabase
      .from('asset_request_permissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
      }
      log.error('Failed to fetch asset request permission:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ permission: data });
  } catch (error) {
    log.error('Unexpected error fetching asset request permission:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const payload = await request.json();

    const { data, error } = await supabase
      .from('asset_request_permissions')
      .update({
        allowed_roles: payload.allowed_roles,
        allowed_user_ids: payload.allowed_user_ids,
        denied_user_ids: payload.denied_user_ids,
        max_quantity: payload.max_quantity,
        max_value: payload.max_value,
        requires_justification: payload.requires_justification,
        justification_min_length: payload.justification_min_length,
        auto_approve_below_value: payload.auto_approve_below_value,
        approval_chain: payload.approval_chain,
        escalation_after_hours: payload.escalation_after_hours,
        request_window_start: payload.request_window_start,
        request_window_end: payload.request_window_end,
        blackout_dates: payload.blackout_dates,
        is_active: payload.is_active,
        notes: payload.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
      }
      log.error('Failed to update asset request permission:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ permission: data });
  } catch (error) {
    log.error('Unexpected error updating asset request permission:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const { error } = await supabase
      .from('asset_request_permissions')
      .delete()
      .eq('id', id);

    if (error) {
      log.error('Failed to delete asset request permission:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    log.error('Unexpected error deleting asset request permission:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
