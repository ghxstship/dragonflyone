import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { withAuth, PlatformRole, log } from '@ghxstship/config';

const createPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  preferred_name: z.string().optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'archived', 'pending', 'draft']).default('active'),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
  notes: z.string().optional().nullable(),
  profile_type: z.enum(['artist', 'crew', 'vendor_rep', 'volunteer', 'contact']).optional(),
  profile_data: z.record(z.unknown()).optional(),
});

const updatePersonSchema = createPersonSchema.partial();

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived', 'pending', 'draft']).optional(),
  tags: z.string().optional(),
  profile_type: z.enum(['artist', 'crew', 'vendor_rep', 'volunteer', 'contact']).optional(),
  include_profiles: z.coerce.boolean().default(true),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

type ProfileType = 'artist' | 'crew' | 'vendor_rep' | 'volunteer' | 'contact';

const PROFILE_TABLES: Record<ProfileType, string> = {
  artist: 'people_profile_artist',
  crew: 'people_profile_crew',
  vendor_rep: 'people_profile_vendor_rep',
  volunteer: 'people_profile_volunteer',
  contact: 'people_profile_contact',
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('platform_user_id', session.user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    const { page, pageSize, search, status, tags, profile_type, include_profiles } = params;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('legend_people')
      .select('*', { count: 'exact' })
      .eq('organization_id', userOrg.organization_id)
      .order('first_name', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (tags) {
      const tagArray = tags.split(',');
      query = query.overlaps('tags', tagArray);
    }

    const { data: people, error, count } = await query;

    if (error) {
      log.error('Error fetching legend people', error, { endpoint: '/api/legend/people', method: 'GET' });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let result = people;

    if (include_profiles && people && people.length > 0) {
      const personIds = people.map((p) => p.id);
      
      if (profile_type) {
        const profileTable = PROFILE_TABLES[profile_type];
        const { data: profiles } = await supabase
          .from(profileTable)
          .select('*')
          .in('person_id', personIds);

        result = people
          .filter((person) => profiles?.some((p) => p.person_id === person.id))
          .map((person) => ({
            ...person,
            profile: profiles?.find((p) => p.person_id === person.id),
          }));
      } else {
        const [artists, crew, vendorReps, volunteers, contacts] = await Promise.all([
          supabase.from('people_profile_artist').select('*').in('person_id', personIds),
          supabase.from('people_profile_crew').select('*').in('person_id', personIds),
          supabase.from('people_profile_vendor_rep').select('*').in('person_id', personIds),
          supabase.from('people_profile_volunteer').select('*').in('person_id', personIds),
          supabase.from('people_profile_contact').select('*').in('person_id', personIds),
        ]);

        result = people.map((person) => ({
          ...person,
          profiles: {
            artist: artists.data?.find((a) => a.person_id === person.id),
            crew: crew.data?.find((c) => c.person_id === person.id),
            vendor_rep: vendorReps.data?.find((v) => v.person_id === person.id),
            volunteer: volunteers.data?.find((v) => v.person_id === person.id),
            contact: contacts.data?.find((c) => c.person_id === person.id),
          },
        }));
      }
    }

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    log.error('Error in GET /api/legend/people', error, { endpoint: '/api/legend/people', method: 'GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('platform_user_id', session.user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (!['owner', 'admin', 'manager'].includes(userOrg.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { profile_type, profile_data, ...personData } = createPersonSchema.parse(body);

    const { data: person, error: personError } = await supabase
      .from('legend_people')
      .insert({
        ...personData,
        organization_id: userOrg.organization_id,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select()
      .single();

    if (personError) {
      log.error('Error creating legend person', personError, { endpoint: '/api/legend/people', method: 'POST' });
      return NextResponse.json({ error: personError.message }, { status: 500 });
    }

    if (profile_type && profile_data) {
      const profileTable = PROFILE_TABLES[profile_type];
      const { error: profileError } = await supabase
        .from(profileTable)
        .insert({
          person_id: person.id,
          ...profile_data,
        });

      if (profileError) {
        await supabase.from('legend_people').delete().eq('id', person.id);
        log.error('Error creating profile', profileError, { endpoint: '/api/legend/people', method: 'POST', personId: person.id });
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ data: person }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    log.error('Error in POST /api/legend/people', error, { endpoint: '/api/legend/people', method: 'POST' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('platform_user_id', session.user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (!['owner', 'admin', 'manager'].includes(userOrg.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, profile_type, profile_data, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
    }

    const validatedData = updatePersonSchema.parse(updates);

    const { data: person, error: personError } = await supabase
      .from('legend_people')
      .update({
        ...validatedData,
        updated_by: session.user.id,
      })
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .select()
      .single();

    if (personError) {
      log.error('Error updating legend person', personError, { endpoint: '/api/legend/people', method: 'PUT', personId: id });
      return NextResponse.json({ error: personError.message }, { status: 500 });
    }

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    if (profile_type && profile_data && profile_type in PROFILE_TABLES) {
      const profileTable = PROFILE_TABLES[profile_type as ProfileType];
      const { error: profileError } = await supabase
        .from(profileTable)
        .upsert({
          person_id: id,
          ...profile_data,
        }, { onConflict: 'person_id' });

      if (profileError) {
        log.error('Error updating profile', profileError, { endpoint: '/api/legend/people', method: 'PUT', personId: id, profileType: profile_type });
      }
    }

    return NextResponse.json({ data: person });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    log.error('Error in PUT /api/legend/people', error, { endpoint: '/api/legend/people', method: 'PUT' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role')
      .eq('platform_user_id', session.user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (!['owner', 'admin'].includes(userOrg.role)) {
      return NextResponse.json({ error: 'Forbidden: Only owners and admins can delete' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('legend_people')
      .delete()
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id);

    if (error) {
      log.error('Error deleting legend person', error, { endpoint: '/api/legend/people', method: 'DELETE', personId: id });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    log.error('Error in DELETE /api/legend/people', error, { endpoint: '/api/legend/people', method: 'DELETE' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
