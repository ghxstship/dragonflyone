import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log } from '@ghxstship/config';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    const payload = await request.json();

    if (!payload.source_item_id || !payload.organization_id) {
      return NextResponse.json(
        { error: 'source_item_id and organization_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('duplicate_catalog_item_to_org', {
      p_source_item_id: payload.source_item_id,
      p_organization_id: payload.organization_id,
      p_custom_item_id: payload.custom_item_id || null,
      p_custom_name: payload.custom_name || null,
      p_is_locked: payload.is_locked || false,
      p_created_by: payload.created_by || null,
    });

    if (error) {
      log.error('Failed to duplicate catalog item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: newItem, error: fetchError } = await supabase
      .from('organization_catalog_items')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      log.error('Failed to fetch duplicated item:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error duplicating catalog item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
