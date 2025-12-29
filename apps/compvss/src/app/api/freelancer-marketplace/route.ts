export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createProfileSchema = z.object({
  action: z.literal('create_profile'),
  bio: z.string().optional(),
  hourly_rate: z.number().optional(),
  skills: z.array(z.object({
    skill: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  })).optional(),
  location: z.string().optional(),
  portfolio_url: z.string().url().optional(),
});

const requestVerificationSchema = z.object({
  action: z.literal('request_verification'),
  freelancer_id: z.string().uuid(),
  documents: z.array(z.string()).optional(),
});

const freelancerActionSchema = z.union([createProfileSchema, requestVerificationSchema]);

// Freelancer marketplace with verified profiles
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
    const location = searchParams.get('location');
    const verified = searchParams.get('verified') === 'true';
    const available = searchParams.get('available') === 'true';

    let query = supabase.from('freelancers').select(`
      *, skills:freelancer_skills(skill, level),
      certifications:freelancer_certifications(name, verified, expiry_date),
      ratings:freelancer_ratings(rating, review)
    `).eq('profile_active', true);

    if (verified) query = query.eq('verified', true);
    if (location) query = query.ilike('location', `%${location}%`);

    const { data, error } = await query.order('rating_avg', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Filter by skills if specified
    interface SkillEntry { skill: string }
    interface RatingEntry { rating: number }
    interface FreelancerData { id: string; skills?: SkillEntry[]; ratings?: RatingEntry[] }
    let filtered = data as FreelancerData[] | null;
    if (skills) {
      const skillList = skills.split(',');
      filtered = filtered?.filter((f: FreelancerData) => 
        f.skills?.some((s: SkillEntry) => skillList.includes(s.skill))
      ) || null;
    }

    // Filter by availability
    if (available) {
      const now = new Date().toISOString();
      const { data: unavailable } = await supabase.from('freelancer_bookings').select('freelancer_id')
        .lte('start_date', now).gte('end_date', now);
      const unavailableIds = new Set(unavailable?.map(u => u.freelancer_id));
      filtered = filtered?.filter((f: FreelancerData) => !unavailableIds.has(f.id)) || null;
    }

    return NextResponse.json({
      freelancers: filtered?.map((f: FreelancerData) => ({
        ...f,
        avg_rating: f.ratings?.length ? f.ratings.reduce((s: number, r: RatingEntry) => s + r.rating, 0) / f.ratings.length : null
      }))
    });
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
    const validatedData = freelancerActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_profile') {
      const { bio, hourly_rate, skills, location, portfolio_url } = validatedData as z.infer<typeof createProfileSchema>;

      const { data, error } = await supabase.from('freelancers').insert({
        user_id: user.id, bio, hourly_rate, location, portfolio_url,
        profile_active: true, verified: false
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Add skills
      if (skills?.length) {
        await supabase.from('freelancer_skills').insert(
          skills.map((s: Record<string, unknown>) => ({ freelancer_id: data.id, skill: s.skill, level: s.level || 'intermediate' }))
        );
      }

      return NextResponse.json({ profile: data }, { status: 201 });
    }

    if (action === 'request_verification') {
      const { freelancer_id, documents } = validatedData as z.infer<typeof requestVerificationSchema>;

      await supabase.from('verification_requests').insert({
        freelancer_id, documents: documents || [], status: 'pending',
        requested_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: 'Verification request submitted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
