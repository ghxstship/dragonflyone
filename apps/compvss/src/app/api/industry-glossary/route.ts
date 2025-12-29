export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createGlossaryTermSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  category: z.string().optional(),
  related_terms: z.array(z.string()).optional(),
  examples: z.array(z.string()).optional(),
});

// Glossary of industry terminology
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const letter = searchParams.get('letter');
    const search = searchParams.get('search');

    let query = supabase.from('glossary_terms').select('*');

    if (category) query = query.eq('category', category);
    if (letter) query = query.ilike('term', `${letter}%`);
    if (search) query = query.or(`term.ilike.%${search}%,definition.ilike.%${search}%`);

    const { data, error } = await query.order('term', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Group by first letter
    interface GlossaryTerm { id: string; term: string; definition: string; category?: string }
    const byLetter: Record<string, GlossaryTerm[]> = {};
    data?.forEach((term: GlossaryTerm) => {
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
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createGlossaryTermSchema.parse(body);
    const { term, definition, category, related_terms, examples } = validatedData;

    const { data, error } = await supabase.from('glossary_terms').insert({
      term, definition, category, related_terms: related_terms || [], examples: examples || []
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ term: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
