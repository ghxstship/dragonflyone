import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const opportunitySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  opportunity_type: z.enum(['gig', 'job', 'rfp', 'contract', 'freelance', 'volunteer']),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(100).optional(),
  required_skills: z.array(z.string()).optional(),
  required_certifications: z.array(z.string()).optional(),
  experience_level: z.enum(['entry', 'intermediate', 'senior', 'expert']).optional(),
  location_type: z.enum(['onsite', 'remote', 'hybrid']).optional(),
  location_city: z.string().max(100).optional(),
  location_state: z.string().max(100).optional(),
  location_country: z.string().max(100).optional(),
  venue_name: z.string().max(255).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  application_deadline: z.string().optional(),
  compensation_type: z.enum(['hourly', 'daily', 'flat', 'negotiable', 'volunteer']).optional(),
  compensation_min: z.number().optional(),
  compensation_max: z.number().optional(),
  compensation_currency: z.string().max(3).default('USD'),
  contact_name: z.string().max(255).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(50).optional(),
  is_featured: z.boolean().default(false),
  is_urgent: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const opportunity_type = searchParams.get('opportunity_type');
    const category = searchParams.get('category');
    const location_type = searchParams.get('location_type');
    const experience_level = searchParams.get('experience_level');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('marketplace_opportunities')
      .select(`
        *,
        organization:organizations(id, name, logo_url),
        creator:platform_users!created_by(id, full_name)
      `, { count: 'exact' })
      .eq('status', 'published');

    if (opportunity_type) {
      query = query.eq('opportunity_type', opportunity_type);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (location_type) {
      query = query.eq('location_type', location_type);
    }
    if (experience_level) {
      query = query.eq('experience_level', experience_level);
    }
    if (city) {
      query = query.ilike('location_city', `%${city}%`);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('is_featured', { ascending: false })
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Get marketplace opportunities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('id, organization_id, platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = opportunitySchema.parse(body);

    const { data, error } = await supabase
      .from('marketplace_opportunities')
      .insert({
        organization_id: platformUser.organization_id,
        ...validated,
        required_skills: validated.required_skills || [],
        required_certifications: validated.required_certifications || [],
        status: 'draft',
        created_by: platformUser.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create marketplace opportunity error:', error);
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    );
  }
}
