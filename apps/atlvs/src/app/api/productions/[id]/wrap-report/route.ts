import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const wrapReportSchema = z.object({
  lessonsLearned: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { id } = params;

    // Get wrap report data
    const { data: wrapReport, error } = await supabase
      .from('wrap_reports')
      .select('*')
      .eq('production_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      log.error('Failed to fetch wrap report', { error, id });
      return NextResponse.json({ error: 'Failed to fetch wrap report' }, { status: 500 });
    }

    // Get production metrics for the wrap report
    const { data: metrics } = await supabase
      .from('metrics')
      .select('*')
      .eq('production_id', id);

    return NextResponse.json({ wrapReport, metrics });
  } catch (error) {
    log.error('Error in wrap report GET', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClient();
    const { id } = params;
    const body = await request.json();
    const validatedData = wrapReportSchema.parse(body);
    const { lessonsLearned, recommendations } = validatedData;

    // Create or update wrap report
    const { data, error } = await supabase
      .from('wrap_reports')
      .upsert({
        production_id: id,
        lessons_learned: lessonsLearned,
        recommendations: recommendations,
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      log.error('Failed to save wrap report', { error, id });
      return NextResponse.json({ error: 'Failed to save wrap report' }, { status: 500 });
    }

    log.info('Wrap report saved', { id });
    return NextResponse.json({ wrapReport: data });
  } catch (error) {
    log.error('Error in wrap report POST', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
