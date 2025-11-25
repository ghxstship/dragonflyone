import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Pre-order functionality with release date management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const status = searchParams.get('status');

    const authHeader = request.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id;
    }

    // Get preorder products
    let query = supabase.from('preorder_products').select(`
      *, product:products(id, name, price, images, description)
    `);

    if (productId) query = query.eq('product_id', productId);
    if (status) query = query.eq('status', status);

    const { data: preorderProducts, error } = await query.order('release_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get user's preorders if authenticated
    let userPreorders: any[] = [];
    if (userId) {
      const { data } = await supabase.from('preorders').select(`
        *, product:preorder_products(*, product:products(name, images))
      `).eq('user_id', userId);
      userPreorders = data || [];
    }

    return NextResponse.json({
      available_preorders: preorderProducts,
      user_preorders: userPreorders,
      upcoming: preorderProducts?.filter(p => new Date(p.release_date) > new Date()) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch preorders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { preorder_product_id, quantity, variant_id } = body;

    // Get preorder product details
    const { data: preorderProduct } = await supabase.from('preorder_products').select(`
      *, product:products(price)
    `).eq('id', preorder_product_id).single();

    if (!preorderProduct) {
      return NextResponse.json({ error: 'Preorder product not found' }, { status: 404 });
    }

    if (preorderProduct.status !== 'active') {
      return NextResponse.json({ error: 'Preorder not available' }, { status: 400 });
    }

    // Check quantity limits
    if (preorderProduct.max_quantity && preorderProduct.current_quantity >= preorderProduct.max_quantity) {
      return NextResponse.json({ error: 'Preorder limit reached' }, { status: 400 });
    }

    const price = preorderProduct.preorder_price || preorderProduct.product?.price;
    const deposit = preorderProduct.deposit_required ? preorderProduct.deposit_amount : price * quantity;

    const { data: preorder, error } = await supabase.from('preorders').insert({
      preorder_product_id, user_id: user.id, quantity, variant_id,
      unit_price: price, total_price: price * quantity,
      deposit_amount: deposit, deposit_paid: false,
      status: 'pending', estimated_ship_date: preorderProduct.release_date
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update preorder count
    await supabase.from('preorder_products').update({
      current_quantity: (preorderProduct.current_quantity || 0) + quantity
    }).eq('id', preorder_product_id);

    return NextResponse.json({ preorder, deposit_required: deposit }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create preorder' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (action === 'cancel') {
      const { data: preorder } = await supabase.from('preorders').select('*')
        .eq('id', id).eq('user_id', user.id).single();

      if (!preorder) return NextResponse.json({ error: 'Preorder not found' }, { status: 404 });
      if (preorder.status !== 'pending') {
        return NextResponse.json({ error: 'Cannot cancel this preorder' }, { status: 400 });
      }

      await supabase.from('preorders').update({
        status: 'cancelled', cancelled_at: new Date().toISOString()
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'pay_deposit') {
      await supabase.from('preorders').update({
        deposit_paid: true, deposit_paid_at: new Date().toISOString(), status: 'confirmed'
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
