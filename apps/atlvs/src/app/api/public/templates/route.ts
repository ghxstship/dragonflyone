export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const templateType = searchParams.get('template_type');
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('templates')
      .select(`
        id,
        name,
        description,
        template_type,
        tags,
        created_at,
        category:template_categories(id, name)
      `, { count: 'exact' })
      .eq('is_public', true)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (templateType && templateType !== 'all') {
      query = query.eq('template_type', templateType);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const templates = data || [];
    const summary = {
      total: count || 0,
      by_type: templates.reduce((acc, t) => {
        acc[t.template_type] = (acc[t.template_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_category: templates.reduce((acc, t) => {
        const categoryName = t.category?.name || 'Uncategorized';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      templates,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch public templates' }, { status: 500 });
  }
}
