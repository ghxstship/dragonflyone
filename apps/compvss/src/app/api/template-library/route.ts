export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createTemplateSchema = z.object({
  action: z.literal('create'),
  name: z.string().min(1),
  category: z.enum(['contract', 'checklist', 'form', 'rider', 'other']),
  description: z.string().optional(),
  file_url: z.string().url(),
  file_type: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

const useTemplateSchema = z.object({
  action: z.literal('use'),
  template_id: z.string().uuid(),
  project_id: z.string().uuid(),
});

const templateActionSchema = z.union([createTemplateSchema, useTemplateSchema]);

// Template library (contracts, checklists, forms, riders)
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

    let query = supabase.from('document_templates').select('*');

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Group by category
    interface Template { id: string; name: string; category: string }
    const byCategory: Record<string, Template[]> = {};
    data?.forEach((t: Template) => {
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
    const validatedData = templateActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { name, category, description, file_url, file_type, tags } = validatedData as z.infer<typeof createTemplateSchema>;

      const { data, error } = await supabase.from('document_templates').insert({
        name, category, description, file_url, file_type,
        tags: tags || [], created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ template: data }, { status: 201 });
    }

    if (action === 'use') {
      const { template_id, project_id } = validatedData as z.infer<typeof useTemplateSchema>;

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
