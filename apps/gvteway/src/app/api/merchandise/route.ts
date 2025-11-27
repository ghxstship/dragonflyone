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

const ProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string(),
  price: z.number().positive(),
  compare_at_price: z.number().optional(),
  sku: z.string().optional(),
  inventory_quantity: z.number().default(0),
  images: z.array(z.string()).optional(),
  variants: z.array(z.object({
    name: z.string(),
    options: z.array(z.string()),
    price_modifier: z.number().default(0),
    sku: z.string().optional(),
    inventory_quantity: z.number().default(0),
  })).optional(),
  event_id: z.string().uuid().optional(),
  artist_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

const OrderItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
  quantity: z.number().positive(),
});

// GET /api/merchandise - Get products and orders
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const productId = searchParams.get('product_id');
    const eventId = searchParams.get('event_id');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';

    if (action === 'categories') {
      const { data: categories } = await supabase
        .from('merchandise_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      return NextResponse.json({ categories: categories || [] });
    }

    if (action === 'orders') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: orders } = await supabase
        .from('merchandise_orders')
        .select(`
          *,
          items:merchandise_order_items(
            *,
            product:merchandise_products(name, images)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return NextResponse.json({ orders: orders || [] });
    }

    if (productId) {
      const { data: product } = await supabase
        .from('merchandise_products')
        .select(`
          *,
          variants:merchandise_variants(*),
          reviews:merchandise_reviews(rating, review_text, user:platform_users(first_name))
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Calculate average rating
      const ratings = product.reviews?.filter((r: any) => r.rating) || [];
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 0;

      return NextResponse.json({
        product: {
          ...product,
          average_rating: avgRating.toFixed(1),
          review_count: ratings.length,
        },
      });
    }

    // List products
    let query = supabase
      .from('merchandise_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (featured) {
      query = query.eq('is_featured', true);
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    query = query.range(offset, offset + limit - 1);

    const { data: products, count } = await query;

    return NextResponse.json({
      products: products || [],
      total: count || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch merchandise' }, { status: 500 });
  }
}

// POST /api/merchandise - Create product or place order
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
    const action = body.action || 'create_product';

    if (action === 'create_product') {
      const validated = ProductSchema.parse(body);

      const { data: product, error } = await supabase
        .from('merchandise_products')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create variants if provided
      if (validated.variants && validated.variants.length > 0) {
        const variantRecords = validated.variants.map(v => ({
          product_id: product.id,
          ...v,
        }));

        await supabase.from('merchandise_variants').insert(variantRecords);
      }

      return NextResponse.json({ product }, { status: 201 });
    } else if (action === 'place_order') {
      const { items, shipping_address, billing_address, payment_method_id } = body;

      // Validate items
      const validatedItems = z.array(OrderItemSchema).parse(items);

      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of validatedItems) {
        const { data: product } = await supabase
          .from('merchandise_products')
          .select('price, name')
          .eq('id', item.product_id)
          .single();

        if (!product) {
          return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
        }

        let itemPrice = product.price;

        if (item.variant_id) {
          const { data: variant } = await supabase
            .from('merchandise_variants')
            .select('price_modifier')
            .eq('id', item.variant_id)
            .single();

          if (variant) {
            itemPrice += variant.price_modifier || 0;
          }
        }

        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          unit_price: itemPrice,
          total_price: itemTotal,
        });
      }

      // Calculate shipping and tax (simplified)
      const shippingCost = subtotal > 100 ? 0 : 9.99;
      const taxRate = 0.08;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + shippingCost + taxAmount;

      // Generate order number
      const { data: lastOrder } = await supabase
        .from('merchandise_orders')
        .select('order_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastNumber = lastOrder?.order_number ? parseInt(lastOrder.order_number.replace('MO-', '')) : 0;
      const orderNumber = `MO-${String(lastNumber + 1).padStart(6, '0')}`;

      // Create order
      const { data: order, error } = await supabase
        .from('merchandise_orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          shipping_address,
          billing_address,
          payment_method_id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create order items
      const itemRecords = orderItems.map(item => ({
        order_id: order.id,
        ...item,
      }));

      await supabase.from('merchandise_order_items').insert(itemRecords);

      // Update inventory
      for (const item of validatedItems) {
        if (item.variant_id) {
          await supabase.rpc('decrement_variant_inventory', {
            p_variant_id: item.variant_id,
            p_quantity: item.quantity,
          });
        } else {
          await supabase.rpc('decrement_product_inventory', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
          });
        }
      }

      return NextResponse.json({ order }, { status: 201 });
    } else if (action === 'add_review') {
      const { product_id, rating, review_text } = body;

      // Check if user purchased this product
      const { data: purchase } = await supabase
        .from('merchandise_order_items')
        .select('id, order:merchandise_orders!inner(user_id)')
        .eq('product_id', product_id)
        .eq('order.user_id', user.id)
        .limit(1)
        .single();

      const { data: review, error } = await supabase
        .from('merchandise_reviews')
        .insert({
          product_id,
          user_id: user.id,
          rating,
          review_text,
          verified_purchase: !!purchase,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ review }, { status: 201 });
    } else if (action === 'add_to_wishlist') {
      const { product_id } = body;

      const { data: wishlistItem, error } = await supabase
        .from('merchandise_wishlist')
        .upsert({
          user_id: user.id,
          product_id,
        }, { onConflict: 'user_id,product_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ wishlist_item: wishlistItem }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/merchandise - Update product or order
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const orderId = searchParams.get('order_id');

    const body = await request.json();

    if (productId) {
      const { data: product, error } = await supabase
        .from('merchandise_products')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ product });
    }

    if (orderId) {
      const { data: order, error } = await supabase
        .from('merchandise_orders')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ order });
    }

    return NextResponse.json({ error: 'Product or order ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/merchandise - Remove from wishlist
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('merchandise_wishlist')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
