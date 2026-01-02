export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createTemplateSchema = z.object({
  action: z.literal('create'),
  name: z.string(),
  category: z.string().optional(),
  content: z.string().optional(),
  sections: z.array(z.record(z.unknown())).optional(),
  branding: z.record(z.unknown()).optional(),
});

const generateProposalSchema = z.object({
  action: z.literal('generate'),
  template_id: z.string().uuid(),
  rfp_id: z.string().uuid().optional(),
  variables: z.record(z.string()).optional(),
});

const proposalActionSchema = z.union([createTemplateSchema, generateProposalSchema]);

// Proposal template library with custom branding
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase.from('proposal_templates').select('*')
      .or(`is_public.eq.true,created_by.eq.${userId}`);

    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ templates: data });
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

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = proposalActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { name, category, content, sections, branding } = validatedData as z.infer<typeof createTemplateSchema>;

      const { data, error } = await supabase.from('proposal_templates').insert({
        name, category, content, sections: sections || [],
        branding: branding || {}, is_public: false, created_by: userId
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
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
        rfp_id, template_id, content, status: 'draft', created_by: userId
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ proposal: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
