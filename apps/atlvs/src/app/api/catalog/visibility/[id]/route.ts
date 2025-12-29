import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const updateVisibilitySchema = z.object({
  is_visible: z.boolean().optional(),
  is_requestable: z.boolean().optional(),
  requires_approval: z.boolean().optional(),
  approval_role: z.string().optional(),
  max_quantity_per_request: z.number().optional(),
  max_value_per_request: z.number().optional(),
  budget_period: z.string().optional(),
  budget_limit: z.number().optional(),
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
      .from('catalog_visibility_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }
      log.error('Failed to fetch catalog visibility setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ setting: data });
  } catch (error) {
    log.error('Unexpected error fetching catalog visibility setting:', error);
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
    const validatedData = updateVisibilitySchema.parse(payload);

    const { data, error } = await supabase
      .from('catalog_visibility_settings')
      .update({
        is_visible: validatedData.is_visible,
        is_requestable: validatedData.is_requestable,
        requires_approval: validatedData.requires_approval,
        approval_role: validatedData.approval_role,
        max_quantity_per_request: validatedData.max_quantity_per_request,
        max_value_per_request: validatedData.max_value_per_request,
        budget_period: validatedData.budget_period,
        budget_limit: validatedData.budget_limit,
        notes: validatedData.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }
      log.error('Failed to update catalog visibility setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ setting: data });
  } catch (error) {
    log.error('Unexpected error updating catalog visibility setting:', error);
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
      .from('catalog_visibility_settings')
      .delete()
      .eq('id', id);

    if (error) {
      log.error('Failed to delete catalog visibility setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    log.error('Unexpected error deleting catalog visibility setting:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
