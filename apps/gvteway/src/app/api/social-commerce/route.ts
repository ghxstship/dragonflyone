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

const ShoppablePostSchema = z.object({
  content: z.string().min(1).max(2000),
  media_urls: z.array(z.string()).optional(),
  products: z.array(z.object({
    product_id: z.string().uuid(),
    position: z.object({
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
    }).optional(),
  })),
  event_id: z.string().uuid().optional(),
});

// GET /api/social-commerce - Get shoppable content and social shopping features
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const authHeader = request.headers.get('authorization');

    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    if (action === 'feed') {
      // Get shoppable posts feed
      const { data: posts } = await supabase
        .from('shoppable_posts')
        .select(`
          *,
          author:platform_users!user_id(id, first_name, last_name, avatar_url),
          products:shoppable_post_products(
            product:merchandise_products(id, name, price, images)
          ),
          likes:shoppable_post_likes(count),
          comments:shoppable_post_comments(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({ posts: posts || [] });
    }

    if (action === 'trending_products') {
      // Get trending products based on social engagement
      const { data: trending } = await supabase
        .from('merchandise_products')
        .select(`
          id, name, price, images, description,
          social_stats:product_social_stats(views, shares, saves, purchases)
        `)
        .eq('status', 'active')
        .order('social_score', { ascending: false })
        .limit(12);

      return NextResponse.json({ trending: trending || [] });
    }

    if (action === 'influencer_picks') {
      // Get products recommended by influencers
      const { data: picks } = await supabase
        .from('influencer_recommendations')
        .select(`
          *,
          influencer:platform_users!influencer_id(id, first_name, last_name, avatar_url),
          product:merchandise_products(id, name, price, images)
        `)
        .eq('is_active', true)
        .order('engagement_score', { ascending: false })
        .limit(10);

      return NextResponse.json({ picks: picks || [] });
    }

    if (action === 'live_shopping') {
      // Get active live shopping sessions
      const { data: liveSessions } = await supabase
        .from('live_shopping_sessions')
        .select(`
          *,
          host:platform_users!host_id(id, first_name, last_name, avatar_url),
          products:live_shopping_products(
            product:merchandise_products(id, name, price, images)
          )
        `)
        .eq('status', 'live')
        .order('viewer_count', { ascending: false });

      return NextResponse.json({ live_sessions: liveSessions || [] });
    }

    if (action === 'wishlist' && userId) {
      const { data: wishlist } = await supabase
        .from('social_wishlists')
        .select(`
          *,
          product:merchandise_products(id, name, price, images)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return NextResponse.json({ wishlist: wishlist || [] });
    }

    if (action === 'shared_carts') {
      // Get public shared carts
      const { data: carts } = await supabase
        .from('shared_carts')
        .select(`
          *,
          creator:platform_users!creator_id(first_name, last_name, avatar_url),
          items:shared_cart_items(
            product:merchandise_products(id, name, price, images)
          )
        `)
        .eq('is_public', true)
        .order('views', { ascending: false })
        .limit(10);

      return NextResponse.json({ shared_carts: carts || [] });
    }

    if (action === 'product_reviews') {
      const productId = searchParams.get('product_id');
      if (!productId) {
        return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
      }

      const { data: reviews } = await supabase
        .from('social_product_reviews')
        .select(`
          *,
          author:platform_users!user_id(first_name, last_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('helpful_count', { ascending: false });

      // Get rating summary
      const { data: summary } = await supabase
        .from('product_rating_summary')
        .select('*')
        .eq('product_id', productId)
        .single();

      return NextResponse.json({
        reviews: reviews || [],
        summary: summary || { average_rating: 0, total_reviews: 0 },
      });
    }

    if (action === 'group_buys') {
      // Get active group buying campaigns
      const { data: groupBuys } = await supabase
        .from('group_buy_campaigns')
        .select(`
          *,
          product:merchandise_products(id, name, price, images),
          participants:group_buy_participants(count)
        `)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('participants_count', { ascending: false });

      return NextResponse.json({ group_buys: groupBuys || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch social commerce data' }, { status: 500 });
  }
}

// POST /api/social-commerce - Create shoppable content and social interactions
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_post';

    if (action === 'create_post') {
      const validated = ShoppablePostSchema.parse(body);

      // Create shoppable post
      const { data: post, error } = await supabase
        .from('shoppable_posts')
        .insert({
          user_id: user.id,
          content: validated.content,
          media_urls: validated.media_urls,
          event_id: validated.event_id,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Link products
      if (validated.products.length > 0) {
        const productLinks = validated.products.map(p => ({
          post_id: post.id,
          product_id: p.product_id,
          position: p.position,
        }));

        await supabase.from('shoppable_post_products').insert(productLinks);
      }

      return NextResponse.json({ post }, { status: 201 });
    } else if (action === 'like_post') {
      const { post_id } = body;

      const { data: existing } = await supabase
        .from('shoppable_post_likes')
        .select('id')
        .eq('post_id', post_id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase.from('shoppable_post_likes').delete().eq('id', existing.id);
        return NextResponse.json({ liked: false });
      }

      await supabase.from('shoppable_post_likes').insert({
        post_id,
        user_id: user.id,
      });

      return NextResponse.json({ liked: true });
    } else if (action === 'comment_post') {
      const { post_id, content } = body;

      const { data: comment, error } = await supabase
        .from('shoppable_post_comments')
        .insert({
          post_id,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ comment }, { status: 201 });
    } else if (action === 'add_to_wishlist') {
      const { product_id, notes } = body;

      const { data: item, error } = await supabase
        .from('social_wishlists')
        .upsert({
          user_id: user.id,
          product_id,
          notes,
        }, { onConflict: 'user_id,product_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ item });
    } else if (action === 'remove_from_wishlist') {
      const { product_id } = body;

      await supabase
        .from('social_wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product_id);

      return NextResponse.json({ success: true });
    } else if (action === 'share_cart') {
      const { name, items, is_public } = body;

      const { data: cart, error } = await supabase
        .from('shared_carts')
        .insert({
          creator_id: user.id,
          name,
          is_public: is_public || false,
          share_code: generateShareCode(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add items
      if (items?.length > 0) {
        const cartItems = items.map((item: any) => ({
          cart_id: cart.id,
          product_id: item.product_id,
          quantity: item.quantity || 1,
        }));

        await supabase.from('shared_cart_items').insert(cartItems);
      }

      return NextResponse.json({ cart }, { status: 201 });
    } else if (action === 'join_group_buy') {
      const { campaign_id, quantity } = body;

      // Check if campaign is active
      const { data: campaign } = await supabase
        .from('group_buy_campaigns')
        .select('*')
        .eq('id', campaign_id)
        .eq('status', 'active')
        .single();

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found or inactive' }, { status: 404 });
      }

      // Add participant
      const { data: participant, error } = await supabase
        .from('group_buy_participants')
        .insert({
          campaign_id,
          user_id: user.id,
          quantity: quantity || 1,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update participant count
      await supabase.rpc('increment_group_buy_participants', { p_campaign_id: campaign_id });

      return NextResponse.json({ participant }, { status: 201 });
    } else if (action === 'submit_review') {
      const { product_id, rating, title, content, media_urls } = body;

      // Check if user purchased the product
      const { data: purchase } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .contains('items', [{ product_id }])
        .single();

      const { data: review, error } = await supabase
        .from('social_product_reviews')
        .insert({
          product_id,
          user_id: user.id,
          rating,
          title,
          content,
          media_urls,
          verified_purchase: !!purchase,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ review }, { status: 201 });
    } else if (action === 'share_product') {
      const { product_id, platform } = body;

      // Log share for analytics
      await supabase.from('product_shares').insert({
        product_id,
        user_id: user.id,
        platform,
      });

      // Update social score
      await supabase.rpc('increment_product_shares', { p_product_id: product_id });

      return NextResponse.json({ success: true });
    } else if (action === 'start_live_shopping') {
      const { title, description, product_ids } = body;

      const { data: session, error } = await supabase
        .from('live_shopping_sessions')
        .insert({
          host_id: user.id,
          title,
          description,
          status: 'scheduled',
          stream_key: generateStreamKey(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add products
      if (product_ids?.length > 0) {
        const products = product_ids.map((productId: string, index: number) => ({
          session_id: session.id,
          product_id: productId,
          display_order: index,
        }));

        await supabase.from('live_shopping_products').insert(products);
      }

      return NextResponse.json({ session }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper functions
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateStreamKey(): string {
  return `live_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
