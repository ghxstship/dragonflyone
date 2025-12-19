export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const updateItemSchema = z.object({
  category_id: z.string().uuid().optional(),
  vendor_profile_id: z.string().uuid().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  unit_type: z.string().optional(),
  base_price: z.number().min(0).optional(),
  currency: z.string().optional(),
  pricing_rules: z.record(z.unknown()).optional(),
  specifications: z.record(z.unknown()).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  min_quantity: z.number().optional(),
  max_quantity: z.number().optional(),
  lead_time_days: z.number().optional(),
  is_taxable: z.boolean().optional(),
  tax_rate: z.number().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'discontinued']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('catalog_items')
      .select(`
        *,
        category:catalog_categories(id, name, icon, global_asset_category),
        vendor:vendor_profiles(id, name, logo_url, contact_info),
        pricing_tiers:catalog_pricing_tiers(*),
        variants:catalog_variants(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = updateItemSchema.parse(body);

    const { data, error } = await supabase
      .from('catalog_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('catalog_items')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
