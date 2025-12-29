import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const updatePermissionSchema = z.object({
  allowed_roles: z.array(z.string()).optional(),
  allowed_user_ids: z.array(z.string().uuid()).optional(),
  denied_user_ids: z.array(z.string().uuid()).optional(),
  max_quantity: z.number().optional(),
  max_value: z.number().optional(),
  requires_justification: z.boolean().optional(),
  justification_min_length: z.number().optional(),
  auto_approve_below_value: z.number().optional(),
  approval_chain: z.array(z.string()).optional(),
  escalation_after_hours: z.number().optional(),
  request_window_start: z.string().optional(),
  request_window_end: z.string().optional(),
  blackout_dates: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  notes: z.string().optional(),
});

export const dynamic = 'force-dynamic';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

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
    const validatedData = updatePermissionSchema.parse(payload);

    const { data, error } = await supabase
      .from('asset_request_permissions')
      .update({
        allowed_roles: validatedData.allowed_roles,
        allowed_user_ids: validatedData.allowed_user_ids,
        denied_user_ids: validatedData.denied_user_ids,
        max_quantity: validatedData.max_quantity,
        max_value: validatedData.max_value,
        requires_justification: validatedData.requires_justification,
        justification_min_length: validatedData.justification_min_length,
        auto_approve_below_value: validatedData.auto_approve_below_value,
        approval_chain: validatedData.approval_chain,
        escalation_after_hours: validatedData.escalation_after_hours,
        request_window_start: validatedData.request_window_start,
        request_window_end: validatedData.request_window_end,
        blackout_dates: validatedData.blackout_dates,
        is_active: validatedData.is_active,
        notes: validatedData.notes,
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
