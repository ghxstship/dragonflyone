import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const include_categories = searchParams.get('include_categories') === 'true';

    if (include_categories) {
      // Return categories with their specialties
      const { data: categories, error: catError } = await supabase
        .from('specialty_categories')
        .select(`
          *,
          specialties(id, name, code, description, experience_levels)
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (catError) throw catError;

      return NextResponse.json({ data: categories });
    }

    // Return just specialties
    let query = supabase
      .from('specialties')
      .select(`
        *,
        category:specialty_categories(id, name, code)
      `)
      .eq('is_active', true);

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    );
  }
}
