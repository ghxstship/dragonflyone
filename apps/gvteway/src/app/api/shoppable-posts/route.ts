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

const shoppablePostSchema = z.object({
  platform: z.string(),
  post_url: z.string().url(),
  image_url: z.string().url(),
  caption: z.string().optional(),
  product_tags: z.array(z.object({
    product_id: z.string().uuid(),
    x_position: z.number(),
    y_position: z.number(),
  })),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const productId = searchParams.get('product_id');

    let query = supabase
      .from('shoppable_posts')
      .select(`*, tags:shoppable_post_tags(*, product:products(id, name, price, image_url))`)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (platform) query = query.eq('platform', platform);

    const { data: posts, error } = await query;
    if (error) throw error;

    if (productId) {
      const filtered = posts?.filter(p => 
        p.tags?.some((t: any) => t.product_id === productId)
      );
      return NextResponse.json({ posts: filtered });
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = shoppablePostSchema.parse(body);

    // Create shoppable post
    const { data: post, error } = await supabase
      .from('shoppable_posts')
      .insert({
        platform: validated.platform,
        post_url: validated.post_url,
        image_url: validated.image_url,
        caption: validated.caption,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Create product tags
    const tags = validated.product_tags.map(tag => ({
      shoppable_post_id: post.id,
      product_id: tag.product_id,
      x_position: tag.x_position,
      y_position: tag.y_position,
    }));

    const { data: createdTags, error: tagError } = await supabase
      .from('shoppable_post_tags')
      .insert(tags)
      .select();

    if (tagError) throw tagError;

    return NextResponse.json({ post, tags: createdTags }, { status: 201 });
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
    const { id, action, ...updates } = body;

    if (action === 'add_tag') {
      const { product_id, x_position, y_position } = updates;

      const { data: tag, error } = await supabase
        .from('shoppable_post_tags')
        .insert({
          shoppable_post_id: id,
          product_id,
          x_position,
          y_position,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ tag });
    }

    if (action === 'remove_tag') {
      const { tag_id } = updates;

      const { error } = await supabase
        .from('shoppable_post_tags')
        .delete()
        .eq('id', tag_id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    const { data, error } = await supabase
      .from('shoppable_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ post: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('shoppable_posts')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
