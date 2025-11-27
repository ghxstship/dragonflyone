import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Technical specification sheets and cut sheets
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const manufacturer = searchParams.get('manufacturer');
    const search = searchParams.get('search');

    let query = supabase.from('spec_sheets').select('*');

    if (category) query = query.eq('category', category);
    if (manufacturer) query = query.ilike('manufacturer', `%${manufacturer}%`);
    if (search) query = query.or(`name.ilike.%${search}%,model.ilike.%${search}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ spec_sheets: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, manufacturer, model, category, specifications, pdf_url, cad_url } = body;

    const { data, error } = await supabase.from('spec_sheets').insert({
      name, manufacturer, model, category, specifications: specifications || {}, pdf_url, cad_url
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ spec_sheet: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
