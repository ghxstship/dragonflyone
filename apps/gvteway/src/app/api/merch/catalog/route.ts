import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artist_id');
    const eventId = searchParams.get('event_id');
    const category = searchParams.get('category');
    const isLimited = searchParams.get('limited');
    const isPreorder = searchParams.get('preorder');

    let query = supabase
      .from('merch_products')
      .select(`
        *,
        variants:merch_variants(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (artistId) {
      query = query.eq('artist_id', artistId);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (isLimited === 'true') {
      query = query.eq('is_limited_edition', true);
    }

    if (isPreorder === 'true') {
      query = query.eq('is_preorder', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const products = data?.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      compare_at_price: p.compare_at_price,
      images: p.images || [],
      category: p.category,
      variants: (p.variants || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        options: v.options || {},
        price: v.price || p.price,
        inventory_count: v.inventory_count || 0,
        sku: v.sku,
      })),
      inventory_count: p.inventory_count || 0,
      is_limited_edition: p.is_limited_edition || false,
      is_preorder: p.is_preorder || false,
      release_date: p.release_date,
      tags: p.tags || [],
    })) || [];

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
