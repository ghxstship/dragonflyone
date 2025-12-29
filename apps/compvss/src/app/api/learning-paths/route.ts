export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const enrollSchema = z.object({
  action: z.literal('enroll'),
  path_id: z.string().uuid(),
});

const completeModuleSchema = z.object({
  action: z.literal('complete_module'),
  path_id: z.string().uuid(),
  module_id: z.string().uuid(),
});

const learningActionSchema = z.union([enrollSchema, completeModuleSchema]);

// Learning paths and progressive training
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
    const discipline = searchParams.get('discipline');
    const level = searchParams.get('level');

    let query = supabase.from('learning_paths').select(`
      *, modules:learning_modules(id, title, order, duration_minutes, content_type),
      enrollments:path_enrollments(user_id, progress_percent, completed_at)
    `);

    if (discipline) query = query.eq('discipline', discipline);
    if (level) query = query.eq('level', level);

    const { data, error } = await query.order('title', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ learning_paths: data });
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
    const validatedData = learningActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'enroll') {
      const { path_id } = validatedData as z.infer<typeof enrollSchema>;

      const { data, error } = await supabase.from('path_enrollments').insert({
        path_id, user_id: user.id, progress_percent: 0, started_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ enrollment: data }, { status: 201 });
    }

    if (action === 'complete_module') {
      const { path_id, module_id } = validatedData as z.infer<typeof completeModuleSchema>;

      await supabase.from('module_completions').insert({
        path_id, module_id, user_id: user.id, completed_at: new Date().toISOString()
      });

      // Update progress
      const { data: modules } = await supabase.from('learning_modules').select('id').eq('path_id', path_id);
      const { data: completions } = await supabase.from('module_completions').select('id')
        .eq('path_id', path_id).eq('user_id', user.id);

      const progress = modules?.length ? Math.round((completions?.length || 0) / modules.length * 100) : 0;

      await supabase.from('path_enrollments').update({
        progress_percent: progress,
        completed_at: progress === 100 ? new Date().toISOString() : null
      }).eq('path_id', path_id).eq('user_id', user.id);

      return NextResponse.json({ progress });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
