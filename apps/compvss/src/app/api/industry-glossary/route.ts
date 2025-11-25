import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Glossary of industry terminology
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const letter = searchParams.get('letter');
    const search = searchParams.get('search');

    let query = supabase.from('glossary_terms').select('*');

    if (category) query = query.eq('category', category);
    if (letter) query = query.ilike('term', `${letter}%`);
    if (search) query = query.or(`term.ilike.%${search}%,definition.ilike.%${search}%`);

    const { data, error } = await query.order('term', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by first letter
    const byLetter: Record<string, any[]> = {};
    data?.forEach(term => {
      const firstLetter = term.term[0].toUpperCase();
      if (!byLetter[firstLetter]) byLetter[firstLetter] = [];
      byLetter[firstLetter].push(term);
    });

    return NextResponse.json({ terms: data, by_letter: byLetter });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { term, definition, category, related_terms, examples } = body;

    const { data, error } = await supabase.from('glossary_terms').insert({
      term, definition, category, related_terms: related_terms || [], examples: examples || []
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ term: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
