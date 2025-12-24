export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GVTEWAY_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_VENUE_MANAGER, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.string().min(1),
  available: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - GVTEWAY access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');

    let query = supabase
      .from('pos_menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (category) query = query.eq('category', category);
    if (available !== null) query = query.eq('available', available === 'true');

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching menu items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Error in GET /api/admin/pos/menu-items:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - GVTEWAY access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createMenuItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pos_menu_items')
      .insert(validationResult.data)
      .select()
      .single();

    if (error) {
      logger.error('Error creating menu item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/admin/pos/menu-items:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
