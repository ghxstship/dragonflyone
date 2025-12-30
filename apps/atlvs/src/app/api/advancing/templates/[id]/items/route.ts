import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';
import { z } from 'zod';

const createTemplateItemSchema = z.object({
  catalog_item_id: z.string().uuid().optional(),
  org_catalog_item_id: z.string().uuid().optional(),
  item_name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  default_quantity: z.number().optional(),
  unit: z.string().optional(),
  estimated_unit_cost: z.number().optional(),
  is_required: z.boolean().optional(),
  notes: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id: templateId } = await params;
  
  try {
    const payload = await request.json();
    const validatedData = createTemplateItemSchema.parse(payload);

    const { data: existingItems } = await supabase
      .from('advance_template_items')
      .select('display_order')
      .eq('template_id', templateId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingItems && existingItems.length > 0 
      ? (existingItems[0].display_order || 0) + 1 
      : 0;

    const { data, error } = await supabase
      .from('advance_template_items')
      .insert({
        template_id: templateId,
        catalog_item_id: validatedData.catalog_item_id,
        org_catalog_item_id: validatedData.org_catalog_item_id,
        item_name: validatedData.item_name,
        description: validatedData.description,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        default_quantity: validatedData.default_quantity || 1,
        unit: validatedData.unit || 'Per Unit',
        estimated_unit_cost: validatedData.estimated_unit_cost,
        is_required: validatedData.is_required ?? false,
        notes: validatedData.notes,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      log.error('Failed to add template item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await updateTemplateEstimatedCost(supabase, templateId);

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error adding template item:', error);
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
