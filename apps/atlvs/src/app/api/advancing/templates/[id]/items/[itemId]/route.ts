import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const updateTemplateItemSchema = z.object({
  item_name: z.string().optional(),
  description: z.string().optional(),
  default_quantity: z.number().optional(),
  unit: z.string().optional(),
  estimated_unit_cost: z.number().optional(),
  is_required: z.boolean().optional(),
  notes: z.string().optional(),
  display_order: z.number().optional(),
});

export const dynamic = 'force-dynamic';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const supabase = createAdminClient();
  const { id: templateId, itemId } = await params;
  
  try {
    const payload = await request.json();
    const validatedData = updateTemplateItemSchema.parse(payload);

    const { data, error } = await supabase
      .from('advance_template_items')
      .update({
        item_name: validatedData.item_name,
        description: validatedData.description,
        default_quantity: validatedData.default_quantity,
        unit: validatedData.unit,
        estimated_unit_cost: validatedData.estimated_unit_cost,
        is_required: validatedData.is_required,
        notes: validatedData.notes,
        display_order: validatedData.display_order,
      })
      .eq('id', itemId)
      .eq('template_id', templateId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      log.error('Failed to update template item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await updateTemplateEstimatedCost(supabase, templateId);

    return NextResponse.json({ item: data });
  } catch (error) {
    log.error('Unexpected error updating template item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const supabase = createAdminClient();
  const { id: templateId, itemId } = await params;
  
  try {
    const { error } = await supabase
      .from('advance_template_items')
      .delete()
      .eq('id', itemId)
      .eq('template_id', templateId);

    if (error) {
      log.error('Failed to delete template item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await updateTemplateEstimatedCost(supabase, templateId);

    return NextResponse.json({ message: 'Item removed successfully' });
  } catch (error) {
    log.error('Unexpected error deleting template item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateTemplateEstimatedCost(supabase: ReturnType<typeof createAdminClient>, templateId: string) {
  const { data: items } = await supabase
    .from('advance_template_items')
    .select('default_quantity, estimated_unit_cost')
    .eq('template_id', templateId);

  if (items) {
    const estimatedCost = items.reduce((sum, item) => {
      return sum + ((item.default_quantity || 1) * (item.estimated_unit_cost || 0));
    }, 0);

    await supabase
      .from('advance_templates')
      .update({ estimated_cost: estimatedCost })
      .eq('id', templateId);
  }
}
