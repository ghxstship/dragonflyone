import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const registrySchema = z.object({
  name: z.string().min(1),
  event_type: z.enum(['birthday', 'wedding', 'graduation', 'corporate', 'other']),
  event_date: z.string().datetime().optional(),
  message: z.string().optional(),
  is_public: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const registryId = searchParams.get('registry_id');
    const userId = searchParams.get('user_id');
    const code = searchParams.get('code');

    if (code) {
      const { data: registry, error } = await supabase
        .from('gift_registries')
        .select(`*, items:gift_registry_items(*, product:products(id, name, price, image_url))`)
        .eq('share_code', code)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      return NextResponse.json({ registry });
    }

    if (registryId) {
      const { data: registry, error } = await supabase
        .from('gift_registries')
        .select(`*, items:gift_registry_items(*, product:products(id, name, price, image_url), contributions:gift_contributions(*))`)
        .eq('id', registryId)
        .single();

      if (error) throw error;
      return NextResponse.json({ registry });
    }

    if (userId) {
      const { data: registries, error } = await supabase
        .from('gift_registries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ registries });
    }

    return NextResponse.json({ error: 'registry_id, user_id, or code required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'add_item') {
      const { registry_id, product_id, quantity, priority } = body.data;

      const { data: item, error } = await supabase
        .from('gift_registry_items')
        .insert({
          registry_id,
          product_id,
          quantity_requested: quantity || 1,
          quantity_fulfilled: 0,
          priority: priority || 'normal',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ item }, { status: 201 });
    }

    if (action === 'contribute') {
      const { item_id, contributor_name, contributor_email, quantity, amount } = body.data;

      const { data: contribution, error } = await supabase
        .from('gift_contributions')
        .insert({
          item_id,
          contributor_name,
          contributor_email,
          quantity: quantity || 1,
          amount,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update fulfilled quantity
      const { data: item } = await supabase
        .from('gift_registry_items')
        .select('quantity_fulfilled')
        .eq('id', item_id)
        .single();

      await supabase
        .from('gift_registry_items')
        .update({ quantity_fulfilled: (item?.quantity_fulfilled || 0) + (quantity || 1) })
        .eq('id', item_id);

      return NextResponse.json({ contribution }, { status: 201 });
    }

    const validated = registrySchema.parse(body);
    const userId = body.user_id;

    // Generate share code
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data: registry, error } = await supabase
      .from('gift_registries')
      .insert({
        ...validated,
        user_id: userId,
        share_code: shareCode,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ registry }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: registry, error } = await supabase
      .from('gift_registries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ registry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const itemId = searchParams.get('item_id');

    if (itemId) {
      const { error } = await supabase.from('gift_registry_items').delete().eq('id', itemId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('gift_registries')
      .update({ status: 'closed' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
