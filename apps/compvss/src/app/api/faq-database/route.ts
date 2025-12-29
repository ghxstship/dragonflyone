export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createFaqSchema = z.object({
  action: z.literal('create'),
  category: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

const viewFaqSchema = z.object({
  action: z.literal('view'),
  faq_id: z.string().uuid(),
});

const helpfulFaqSchema = z.object({
  action: z.literal('helpful'),
  faq_id: z.string().uuid(),
  helpful: z.boolean(),
});

const faqActionSchema = z.union([createFaqSchema, viewFaqSchema, helpfulFaqSchema]);

// FAQ database with search functionality
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
    const search = searchParams.get('search');

    let query = supabase.from('faqs').select('*').eq('published', true);

    if (category) query = query.eq('category', category);
    if (search) query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);

    const { data, error } = await query.order('view_count', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Group by category
    interface FAQ { id: string; category: string; question: string; answer: string }
    const byCategory: Record<string, FAQ[]> = {};
    data?.forEach((faq: FAQ) => {
      if (!byCategory[faq.category]) byCategory[faq.category] = [];
      byCategory[faq.category].push(faq);
    });

    return NextResponse.json({ faqs: data, by_category: byCategory });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = faqActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { category, question, answer, tags } = validatedData as z.infer<typeof createFaqSchema>;

      const { data, error } = await supabase.from('faqs').insert({
        category, question, answer, tags: tags || [],
        published: false, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ faq: data }, { status: 201 });
    }

    if (action === 'view') {
      const { faq_id } = validatedData as z.infer<typeof viewFaqSchema>;
      await supabase.rpc('increment_faq_views', { faq_id });
      return NextResponse.json({ success: true });
    }

    if (action === 'helpful') {
      const { faq_id, helpful } = validatedData as z.infer<typeof helpfulFaqSchema>;
      const column = helpful ? 'helpful_count' : 'not_helpful_count';
      await supabase.rpc('increment_faq_feedback', { faq_id, feedback_column: column });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
