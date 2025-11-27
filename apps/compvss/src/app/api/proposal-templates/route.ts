import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Proposal template library with custom branding
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase.from('proposal_templates').select('*')
      .or(`is_public.eq.true,created_by.eq.${user.id}`);

    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ templates: data });
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
      const { name, category, content, sections, branding } = body;

      const { data, error } = await supabase.from('proposal_templates').insert({
        name, category, content, sections: sections || [],
        branding: branding || {}, is_public: false, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ template: data }, { status: 201 });
    }

    if (action === 'generate') {
      const { template_id, rfp_id, variables } = body;

      const { data: template } = await supabase.from('proposal_templates').select('*')
        .eq('id', template_id).single();

      if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

      // Replace variables in content
      let content = template.content;
      Object.entries(variables || {}).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
      });

      const { data, error } = await supabase.from('proposals').insert({
        rfp_id, template_id, content, status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ proposal: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
