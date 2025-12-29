export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createFreelancerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  hourly_rate: z.number().min(0).optional(),
  day_rate: z.number().min(0).optional(),
  portfolio_url: z.string().url().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
});

const rateFreelancerSchema = z.object({
  id: z.string().uuid(),
  action: z.literal('rate'),
  project_id: z.string().uuid(),
  score: z.number().min(1).max(5),
  review: z.string().optional(),
});

const updateFreelancerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  hourly_rate: z.number().min(0).optional(),
  day_rate: z.number().min(0).optional(),
  portfolio_url: z.string().url().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  is_available: z.boolean().optional(),
});

const freelancerPatchSchema = z.union([rateFreelancerSchema, updateFreelancerSchema]);

// Freelancer/gig worker database with rating system
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');
    const minRating = searchParams.get('min_rating');
    const available = searchParams.get('available');

    let query = supabase.from('freelancers').select(`
      *, ratings:freelancer_ratings(score, review, project:projects(name))
    `);

    if (skill) query = query.contains('skills', [skill]);
    if (minRating) query = query.gte('average_rating', parseFloat(minRating));
    if (available === 'true') query = query.eq('is_available', true);

    const { data, error } = await query.order('average_rating', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Get all unique skills
    const allSkills = new Set<string>();
    data?.forEach(f => f.skills?.forEach((s: string) => allSkills.add(s)));

    return NextResponse.json({
      freelancers: data,
      skills: Array.from(allSkills),
      total: data?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch freelancers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createFreelancerSchema.parse(body);
    const { name, email, phone, skills, hourly_rate, day_rate, portfolio_url, bio, location } = validatedData;

    const { data, error } = await supabase.from('freelancers').insert({
      name, email, phone, skills: skills || [], hourly_rate, day_rate,
      portfolio_url, bio, location, is_available: true, average_rating: 0,
      created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ freelancer: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create freelancer' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = freelancerPatchSchema.parse(body);
    const { id } = validatedData;

    if ('action' in validatedData && validatedData.action === 'rate') {
      const { project_id, score, review } = validatedData as z.infer<typeof rateFreelancerSchema>;
      await supabase.from('freelancer_ratings').insert({
        freelancer_id: id, project_id, score, review, rated_by: user.id
      });

      // Update average rating
      const { data: ratings } = await supabase.from('freelancer_ratings').select('score').eq('freelancer_id', id);
      const avgRating = ratings ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : 0;

      await supabase.from('freelancers').update({
        average_rating: Math.round(avgRating * 10) / 10, total_reviews: ratings?.length || 0
      }).eq('id', id);

      return NextResponse.json({ success: true, new_rating: avgRating });
    }

    const { error } = await supabase.from('freelancers').update(body).eq('id', id);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
