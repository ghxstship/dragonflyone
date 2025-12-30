import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';
import { z } from 'zod';

const updateCatalogItemSchema = z.object({
  item_name: z.string().optional(),
  description: z.string().optional(),
  base_price_low: z.number().optional(),
  base_price_high: z.number().optional(),
  standard_unit: z.string().optional(),
  custom_fields: z.record(z.unknown()).optional(),
  internal_notes: z.string().optional(),
  preferred_vendors: z.array(z.string()).optional(),
  is_preferred: z.boolean().optional(),
  enabled: z.boolean().optional(),
  updated_by: z.string().uuid().optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  const { id } = await params;
  
  try {
    const { data, error } = await supabase
      .from('organization_catalog_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      log.error('Failed to fetch organization catalog item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    log.error('Unexpected error fetching organization catalog item:', error);
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
    const validatedData = updateCatalogItemSchema.parse(payload);

    const { data, error } = await supabase
      .from('organization_catalog_items')
      .update({
        item_name: validatedData.item_name,
        description: validatedData.description,
        base_price_low: validatedData.base_price_low,
        base_price_high: validatedData.base_price_high,
        standard_unit: validatedData.standard_unit,
        custom_fields: validatedData.custom_fields,
        internal_notes: validatedData.internal_notes,
        preferred_vendors: validatedData.preferred_vendors,
        is_preferred: validatedData.is_preferred,
        enabled: validatedData.enabled,
        updated_by: validatedData.updated_by,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      log.error('Failed to update organization catalog item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    log.error('Unexpected error updating organization catalog item:', error);
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
      .from('organization_catalog_items')
      .delete()
      .eq('id', id);

    if (error) {
      log.error('Failed to delete organization catalog item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    log.error('Unexpected error deleting organization catalog item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
