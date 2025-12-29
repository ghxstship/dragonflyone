export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const upsertResumeSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(z.record(z.unknown())).optional(),
  education: z.array(z.record(z.unknown())).optional(),
  certifications: z.array(z.string()).optional(),
  portfolio_url: z.string().url().optional(),
  resume_url: z.string().url().optional(),
});

// Resume/portfolio database with search
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
    const skills = searchParams.get('skills');
    const experience = searchParams.get('min_experience');
    const search = searchParams.get('search');

    let query = supabase.from('resumes').select(`
      *, user:platform_users(first_name, last_name, email)
    `).eq('searchable', true);

    if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);

    const { data, error } = await query.order('updated_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    let filtered = data;
    if (skills) {
      const skillList = skills.split(',');
      filtered = data?.filter(r => r.skills?.some((s: string) => skillList.includes(s)));
    }
    if (experience) {
      filtered = filtered?.filter(r => (r.years_experience || 0) >= parseInt(experience));
    }

    return NextResponse.json({ resumes: filtered });
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
    const validatedData = upsertResumeSchema.parse(body);
    const { title, summary, skills, experience, education, certifications, portfolio_url, resume_url } = validatedData;

    const { data, error } = await supabase.from('resumes').upsert({
      user_id: user.id, title, summary, skills: skills || [],
      experience: experience || [], education: education || [],
      certifications: certifications || [], portfolio_url, resume_url,
      searchable: true, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ resume: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
