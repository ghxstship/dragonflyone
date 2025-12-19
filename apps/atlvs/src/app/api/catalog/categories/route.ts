export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createCategorySchema = z.object({
  organization_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  global_asset_category: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().optional(),
});

interface CatalogCategory {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  parent_id?: string;
  global_asset_category?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  children?: CatalogCategory[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const includeGlobal = searchParams.get('include_global') !== 'false';

    let query = supabase
      .from('catalog_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .order('name');

    if (orgId && includeGlobal) {
      query = query.or(`organization_id.is.null,organization_id.eq.${orgId}`);
    } else if (orgId) {
      query = query.eq('organization_id', orgId);
    } else {
      query = query.is('organization_id', null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const buildTree = (items: CatalogCategory[], parentId: string | null = null): CatalogCategory[] => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id),
        }));
    };

    return NextResponse.json({
      categories: data,
      tree: buildTree(data as CatalogCategory[]),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createCategorySchema.parse(body);

    const { data, error } = await supabase
      .from('catalog_categories')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
