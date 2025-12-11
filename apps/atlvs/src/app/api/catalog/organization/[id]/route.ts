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

    const { data, error } = await supabase
      .from('organization_catalog_items')
      .update({
        item_name: payload.item_name,
        description: payload.description,
        base_price_low: payload.base_price_low,
        base_price_high: payload.base_price_high,
        standard_unit: payload.standard_unit,
        custom_fields: payload.custom_fields,
        internal_notes: payload.internal_notes,
        preferred_vendors: payload.preferred_vendors,
        is_preferred: payload.is_preferred,
        enabled: payload.enabled,
        updated_by: payload.updated_by,
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
