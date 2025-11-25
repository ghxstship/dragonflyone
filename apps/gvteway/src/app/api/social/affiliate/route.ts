import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const affiliateLinkSchema = z.object({
  shop_id: z.string().uuid(),
  target_url: z.string().url(),
  product_type: z.string().optional(),
  product_id: z.string().uuid().optional(),
  commission_type: z.enum(['percentage', 'fixed']).default('percentage'),
  commission_value: z.number().min(0),
  expires_at: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const shop_id = searchParams.get('shop_id');

    // Get shops owned by user
    const { data: shops } = await supabase
      .from('social_shops')
      .select('id')
      .eq('owner_id', platformUser.id);

    const shopIds = shops?.map(s => s.id) || [];

    if (shop_id && !shopIds.includes(shop_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let query = supabase
      .from('affiliate_links')
      .select('*')
      .in('shop_id', shop_id ? [shop_id] : shopIds);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get affiliate links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = affiliateLinkSchema.parse(body);

    // Verify user owns the shop
    const { data: shop } = await supabase
      .from('social_shops')
      .select('id')
      .eq('id', validated.shop_id)
      .eq('owner_id', platformUser.id)
      .single();

    if (!shop) {
      return NextResponse.json(
        { error: 'Shop not found or you do not have permission' },
        { status: 403 }
      );
    }

    // Generate unique code
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();

    const { data, error } = await supabase
      .from('affiliate_links')
      .insert({
        shop_id: validated.shop_id,
        code,
        target_url: validated.target_url,
        product_type: validated.product_type,
        product_id: validated.product_id,
        commission_type: validated.commission_type,
        commission_value: validated.commission_value,
        expires_at: validated.expires_at,
      })
      .select()
      .single();

    if (error) throw error;

    // Generate full affiliate URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gvteway.com';
    const affiliateUrl = `${baseUrl}/a/${code}`;

    return NextResponse.json({
      data: {
        ...data,
        affiliate_url: affiliateUrl,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create affiliate link error:', error);
    return NextResponse.json(
      { error: 'Failed to create affiliate link' },
      { status: 500 }
    );
  }
}
