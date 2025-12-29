export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createSchema = z.object({
  action: z.literal('create'),
  rfp_id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  collaborators: z.array(z.object({
    user_id: z.string().uuid(),
    role: z.string().optional(),
  })).optional(),
});

const saveVersionSchema = z.object({
  action: z.literal('save_version'),
  proposal_id: z.string().uuid(),
  content: z.string(),
  comment: z.string().optional(),
});

const addCollaboratorSchema = z.object({
  action: z.literal('add_collaborator'),
  proposal_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.string().optional(),
});

const proposalActionSchema = z.union([createSchema, saveVersionSchema, addCollaboratorSchema]);

// Collaborative proposal creation with version control
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
    const proposalId = searchParams.get('proposal_id');

    if (proposalId) {
      const { data } = await supabase.from('proposals').select(`
        *, versions:proposal_versions(id, version_number, content, created_by, created_at),
        collaborators:proposal_collaborators(user:platform_users(id, first_name, last_name), role)
      `).eq('id', proposalId).single();

      return NextResponse.json({ proposal: data });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase.from('proposal_collaborators').select(`
      proposal:proposals(id, title, status, rfp_id, updated_at)
    `).eq('user_id', user.id);

    return NextResponse.json({ proposals: data?.map(d => d.proposal) });
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
    const validatedData = proposalActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { rfp_id, title, content, collaborators } = validatedData as z.infer<typeof createSchema>;

      const { data, error } = await supabase.from('proposals').insert({
        rfp_id, title, content, status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Add creator as owner
      await supabase.from('proposal_collaborators').insert({ proposal_id: data.id, user_id: user.id, role: 'owner' });

      // Add collaborators
      if (collaborators?.length) {
        await supabase.from('proposal_collaborators').insert(
          collaborators.map((c: Record<string, unknown>) => ({ proposal_id: data.id, user_id: c.user_id, role: c.role || 'editor' }))
        );
      }

      // Create initial version
      await supabase.from('proposal_versions').insert({
        proposal_id: data.id, version_number: 1, content, created_by: user.id
      });

      return NextResponse.json({ proposal: data }, { status: 201 });
    }

    if (action === 'save_version') {
      const { proposal_id, content, comment } = validatedData as z.infer<typeof saveVersionSchema>;

      // Get latest version number
      const { data: latest } = await supabase.from('proposal_versions').select('version_number')
        .eq('proposal_id', proposal_id).order('version_number', { ascending: false }).limit(1).single();

      const newVersion = (latest?.version_number || 0) + 1;

      const { data, error } = await supabase.from('proposal_versions').insert({
        proposal_id, version_number: newVersion, content, comment, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Update proposal content
      await supabase.from('proposals').update({ content, updated_at: new Date().toISOString() }).eq('id', proposal_id);

      return NextResponse.json({ version: data }, { status: 201 });
    }

    if (action === 'add_collaborator') {
      const { proposal_id, user_id, role } = validatedData as z.infer<typeof addCollaboratorSchema>;

      await supabase.from('proposal_collaborators').insert({ proposal_id, user_id, role: role || 'editor' });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
