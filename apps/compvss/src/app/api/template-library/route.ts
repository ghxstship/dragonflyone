import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Template library (contracts, checklists, forms, riders)
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase.from('document_templates').select('*');

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by category
    const byCategory: Record<string, any[]> = {};
    data?.forEach(t => {
      if (!byCategory[t.category]) byCategory[t.category] = [];
      byCategory[t.category].push(t);
    });

    return NextResponse.json({ templates: data, by_category: byCategory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { name, category, description, file_url, file_type, tags } = body;

      const { data, error } = await supabase.from('document_templates').insert({
        name, category, description, file_url, file_type,
        tags: tags || [], created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ template: data }, { status: 201 });
    }

    if (action === 'use') {
      const { template_id, project_id } = body;

      // Log template usage
      await supabase.from('template_usage').insert({
        template_id, project_id, used_by: user.id
      });

      // Get template
      const { data: template } = await supabase.from('document_templates').select('*')
        .eq('id', template_id).single();

      return NextResponse.json({ template });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
