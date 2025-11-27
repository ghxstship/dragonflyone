import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Industry association and resource listings
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase.from('industry_associations').select(`
      *, resources:association_resources(id, title, type, url)
    `);

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ associations: data });
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
    const { name, category, description, website, membership_info, contact_email, resources } = body;

    const { data, error } = await supabase.from('industry_associations').insert({
      name, category, description, website, membership_info, contact_email
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (resources?.length) {
      await supabase.from('association_resources').insert(
        resources.map((r: any) => ({ association_id: data.id, title: r.title, type: r.type, url: r.url }))
      );
    }

    return NextResponse.json({ association: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
