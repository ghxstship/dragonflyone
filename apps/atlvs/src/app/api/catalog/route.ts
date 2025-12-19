export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createItemSchema = z.object({
  organization_id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  vendor_profile_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().optional(),
  unit_type: z.string().default('each'),
  base_price: z.number().min(0),
  currency: z.string().default('USD'),
  pricing_rules: z.record(z.unknown()).optional(),
  specifications: z.record(z.unknown()).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  min_quantity: z.number().min(1).optional(),
  max_quantity: z.number().optional(),
  lead_time_days: z.number().optional(),
  is_taxable: z.boolean().default(true),
  tax_rate: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const categoryId = searchParams.get('category_id');
    const vendorId = searchParams.get('vendor_profile_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    let query = supabase
      .from('catalog_items')
      .select(`
        *,
        category:catalog_categories(id, name, icon),
        vendor:vendor_profiles(id, name, logo_url),
        pricing_tiers:catalog_pricing_tiers(*),
        variants:catalog_variants(*)
      `)
      .eq('organization_id', orgId)
      .order('name');

    if (categoryId) query = query.eq('category_id', categoryId);
    if (vendorId) query = query.eq('vendor_profile_id', vendorId);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createItemSchema.parse(body);

    const { data, error } = await supabase
      .from('catalog_items')
      .insert({
        ...payload,
        images: payload.images || [],
        tags: payload.tags || [],
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
