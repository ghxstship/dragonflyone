import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// FAQ database with search functionality
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase.from('faqs').select('*').eq('published', true);

    if (category) query = query.eq('category', category);
    if (search) query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);

    const { data, error } = await query.order('view_count', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by category
    const byCategory: Record<string, any[]> = {};
    data?.forEach(faq => {
      if (!byCategory[faq.category]) byCategory[faq.category] = [];
      byCategory[faq.category].push(faq);
    });

    return NextResponse.json({ faqs: data, by_category: byCategory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { category, question, answer, tags } = body;

      const { data, error } = await supabase.from('faqs').insert({
        category, question, answer, tags: tags || [],
        published: false, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ faq: data }, { status: 201 });
    }

    if (action === 'view') {
      const { faq_id } = body;
      await supabase.rpc('increment_faq_views', { faq_id });
      return NextResponse.json({ success: true });
    }

    if (action === 'helpful') {
      const { faq_id, helpful } = body;
      const column = helpful ? 'helpful_count' : 'not_helpful_count';
      await supabase.rpc('increment_faq_feedback', { faq_id, feedback_column: column });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
