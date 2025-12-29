export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createPoolSchema = z.object({
  action: z.literal('create_pool'),
  name: z.string().min(1),
  description: z.string().optional(),
  criteria: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

const addCandidateSchema = z.object({
  action: z.literal('add_candidate'),
  pool_id: z.string().uuid(),
  candidate_id: z.string().uuid(),
  skills: z.array(z.string()).optional(),
  rating: z.number().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
});

const updateCandidateSchema = z.object({
  action: z.literal('update_candidate'),
  member_id: z.string().uuid(),
  rating: z.number().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
});

const searchSchema = z.object({
  action: z.literal('search'),
  skills: z.array(z.string()).optional(),
  min_rating: z.number().optional(),
  availability: z.string().optional(),
});

const talentPoolActionSchema = z.union([createPoolSchema, addCandidateSchema, updateCandidateSchema, searchSchema]);

// Talent pool development
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
    const poolId = searchParams.get('pool_id');
    const skills = searchParams.get('skills');

    if (poolId) {
      const { data } = await supabase.from('talent_pools').select(`
        *, members:talent_pool_members(
          candidate:platform_users(id, first_name, last_name, email),
          skills, rating, notes
        )
      `).eq('id', poolId).single();

      return NextResponse.json({ pool: data });
    }

    let query = supabase.from('talent_pools').select(`
      *, member_count:talent_pool_members(count)
    `);

    // Filter by skills if provided
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim());
      query = query.contains('criteria->required_skills', skillList);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ pools: data });
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
    const validatedData = talentPoolActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_pool') {
      const { name, description, criteria, tags } = validatedData as z.infer<typeof createPoolSchema>;

      const { data, error } = await supabase.from('talent_pools').insert({
        name, description, criteria: criteria || {},
        tags: tags || [], created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ pool: data }, { status: 201 });
    }

    if (action === 'add_candidate') {
      const { pool_id, candidate_id, skills, rating, notes, source } = validatedData as z.infer<typeof addCandidateSchema>;

      const { data, error } = await supabase.from('talent_pool_members').insert({
        pool_id, candidate_id, skills: skills || [], rating, notes,
        source: source || 'manual', added_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ member: data }, { status: 201 });
    }

    if (action === 'update_candidate') {
      const { member_id, rating, notes, status } = validatedData as z.infer<typeof updateCandidateSchema>;

      await supabase.from('talent_pool_members').update({
        rating, notes, status, updated_at: new Date().toISOString()
      }).eq('id', member_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'search') {
      const { skills, min_rating, availability } = validatedData as z.infer<typeof searchSchema>;

      let query = supabase.from('talent_pool_members').select(`
        *, candidate:platform_users(id, first_name, last_name, email),
        pool:talent_pools(name)
      `);

      if (min_rating) query = query.gte('rating', min_rating);

      const { data } = await query;

      // Filter by skills
      let filtered: typeof data = data || [];
      if (skills?.length) {
        filtered = (data || []).filter(m => skills.some((s: string) => m.skills?.includes(s)));
      }

      // Filter by availability if specified
      if (availability) {
        filtered = filtered.filter(m => m.availability_status === availability);
      }

      return NextResponse.json({ candidates: filtered });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
