export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const submitSchema = z.object({
  action: z.literal('submit'),
  category: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

const voteSchema = z.object({
  action: z.literal('vote'),
  contribution_id: z.string().uuid(),
  vote_type: z.enum(['up', 'down']),
});

const moderateSchema = z.object({
  action: z.literal('moderate'),
  contribution_id: z.string().uuid(),
  status: z.string(),
  feedback: z.string().optional(),
});

const publishSchema = z.object({
  action: z.literal('publish'),
  contribution_id: z.string().uuid(),
  document_id: z.string().uuid().optional(),
});

const contributionActionSchema = z.union([submitSchema, voteSchema, moderateSchema, publishSchema]);

// User contribution and crowdsourcing features
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
    const status = searchParams.get('status') || 'pending';
    const category = searchParams.get('category');

    let query = supabase.from('user_contributions').select(`
      *, author:platform_users(first_name, last_name),
      votes:contribution_votes(vote_type)
    `);

    if (status !== 'all') query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Calculate vote scores
    const withScores = data?.map(c => ({
      ...c,
      score: (c.votes?.filter((v: Record<string, unknown>) => v.vote_type === 'up').length || 0) -
             (c.votes?.filter((v: Record<string, unknown>) => v.vote_type === 'down').length || 0)
    }));

    return NextResponse.json({ contributions: withScores });
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
    const validatedData = contributionActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'submit') {
      const { category, title, content, tags } = validatedData as z.infer<typeof submitSchema>;

      const { data, error } = await supabase.from('user_contributions').insert({
        category, title, content, tags: tags || [],
        author_id: user.id, status: 'pending'
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ contribution: data }, { status: 201 });
    }

    if (action === 'vote') {
      const { contribution_id, vote_type } = validatedData as z.infer<typeof voteSchema>;

      await supabase.from('contribution_votes').upsert({
        contribution_id, user_id: user.id, vote_type
      }, { onConflict: 'contribution_id,user_id' });

      return NextResponse.json({ success: true });
    }

    if (action === 'moderate') {
      const { contribution_id, status, feedback } = validatedData as z.infer<typeof moderateSchema>;

      await supabase.from('user_contributions').update({
        status, moderator_feedback: feedback, moderated_by: user.id,
        moderated_at: new Date().toISOString()
      }).eq('id', contribution_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'publish') {
      const { contribution_id, document_id } = validatedData as z.infer<typeof publishSchema>;

      // Link contribution to published document
      await supabase.from('user_contributions').update({
        status: 'published', published_document_id: document_id
      }).eq('id', contribution_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
