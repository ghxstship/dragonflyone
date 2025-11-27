import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Union rules and agreements by local
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const unionLocal = searchParams.get('local');
    const category = searchParams.get('category');

    let query = supabase.from('union_rules').select(`
      *, local:union_locals(name, local_number, jurisdiction)
    `);

    if (unionLocal) query = query.eq('local_id', unionLocal);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('category', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ rules: data });
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
    const { local_id, category, title, description, effective_date, expiration_date, document_url, key_provisions } = body;

    const { data, error } = await supabase.from('union_rules').insert({
      local_id, category, title, description, effective_date,
      expiration_date, document_url, key_provisions: key_provisions || []
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rule: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
