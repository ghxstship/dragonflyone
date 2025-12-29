import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { withAuth, PlatformRole } from '@ghxstship/config';

const createPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  preferred_name: z.string().optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().default('US'),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'archived', 'pending', 'draft']).default('active'),
  tags: z.array(z.string()).default([]),
  platform_user_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.unknown()).default({}),
  notes: z.string().optional().nullable(),
});

const updatePersonSchema = createPersonSchema.partial();

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived', 'pending', 'draft']).optional(),
  tags: z.string().optional(),
  department_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
  include_profiles: z.coerce.boolean().default(false),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
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

    const { page, pageSize, search, status, tags, include_profiles } = params;
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('legend_people')
      .select('*', { count: 'exact' })
      .eq('organization_id', userOrg.organization_id)
      .order('display_name', { ascending: true })
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
    if (params.department_id) {
      query = query.eq('department_id', params.department_id);
    }
    if (params.team_id) {
      query = query.eq('team_id', params.team_id);
    }

    const { data: people, error, count } = await query;

    if (error) {
      logger.error('Error fetching legend people', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let result = people;

    if (include_profiles && people && people.length > 0) {
      const personIds = people.map((p) => p.id);
      
      const [employees, crew, artists, vendorReps, volunteers, contacts] = await Promise.all([
        supabase.from('people_profile_employee').select('*').in('person_id', personIds),
        supabase.from('people_profile_crew').select('*').in('person_id', personIds),
        supabase.from('people_profile_artist').select('*').in('person_id', personIds),
        supabase.from('people_profile_vendor_rep').select('*').in('person_id', personIds),
        supabase.from('people_profile_volunteer').select('*').in('person_id', personIds),
        supabase.from('people_profile_contact').select('*').in('person_id', personIds),
      ]);

      result = people.map((person) => ({
        ...person,
        profiles: {
          employee: employees.data?.find((e) => e.person_id === person.id),
          crew: crew.data?.find((c) => c.person_id === person.id),
          artist: artists.data?.find((a) => a.person_id === person.id),
          vendor_rep: vendorReps.data?.find((v) => v.person_id === person.id),
          volunteer: volunteers.data?.find((v) => v.person_id === person.id),
          contact: contacts.data?.find((c) => c.person_id === person.id),
        },
      }));
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
    logger.error('Error in GET /api/legend/people', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
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
    const validatedData = createPersonSchema.parse(body);

    const { data: person, error } = await supabase
      .from('legend_people')
      .insert({
        ...validatedData,
        organization_id: userOrg.organization_id,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating legend person', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: person }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/legend/people', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
    }

    const validatedData = updatePersonSchema.parse(updates);

    const { data: person, error } = await supabase
      .from('legend_people')
      .update({
        ...validatedData,
        updated_by: session.user.id,
      })
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating legend person', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json({ data: person });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PUT /api/legend/people', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
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
      logger.error('Error deleting legend person', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('Error in DELETE /api/legend/people', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
