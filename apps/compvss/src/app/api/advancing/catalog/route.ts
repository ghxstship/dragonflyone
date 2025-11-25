import { NextRequest, NextResponse } from 'next/server';
import { apiRoute } from '@ghxstship/config/middleware';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const GET = apiRoute(
  async (request: NextRequest) => {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { searchParams } = new URL(request.url);
      
      const category = searchParams.get('category');
      const subcategory = searchParams.get('subcategory');
      const search = searchParams.get('search');
      const limit = parseInt(searchParams.get('limit') || '100');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = supabase
        .from('production_advancing_catalog')
        .select('*', { count: 'exact' })
        .eq('enabled', true)
        .order('category')
        .order('subcategory')
        .order('item_name')
        .range(offset, offset + limit - 1);

      if (category) {
        query = query.eq('category', category);
      }

      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }

      if (search) {
        query = query.or(`item_name.ilike.%${search}%,specifications.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get unique categories and subcategories for filtering
      const { data: categories } = await supabase
        .from('production_advancing_catalog')
        .select('category')
        .eq('enabled', true)
        .order('category');

      const uniqueCategories = Array.from(new Set(categories?.map(c => c.category) || []));

      return NextResponse.json({ 
        items: data,
        total: count,
        categories: uniqueCategories,
        limit,
        offset
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  },
  {
    auth: true,
    rateLimit: { maxRequests: 100, windowMs: 60000 },
    audit: { action: 'catalog:view', resource: 'advancing_catalog' },
  }
);
