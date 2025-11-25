import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Code and regulation references
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const jurisdiction = searchParams.get('jurisdiction');
    const search = searchParams.get('search');

    let query = supabase.from('code_regulations').select('*');

    if (category) query = query.eq('category', category);
    if (jurisdiction) query = query.eq('jurisdiction', jurisdiction);
    if (search) query = query.or(`title.ilike.%${search}%,code_number.ilike.%${search}%`);

    const { data, error } = await query.order('category', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by category
    const byCategory: Record<string, any[]> = {};
    data?.forEach(r => {
      if (!byCategory[r.category]) byCategory[r.category] = [];
      byCategory[r.category].push(r);
    });

    return NextResponse.json({ regulations: data, by_category: byCategory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, code_number, category, jurisdiction, description, effective_date, document_url } = body;

    const { data, error } = await supabase.from('code_regulations').insert({
      title, code_number, category, jurisdiction, description, effective_date, document_url
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ regulation: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
