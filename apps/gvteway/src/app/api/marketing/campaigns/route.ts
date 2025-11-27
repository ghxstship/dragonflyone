import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const campaignSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  campaign_type: z.enum(['one_time', 'automated', 'drip', 'triggered', 'ab_test']),
  event_id: z.string().uuid().optional(),
  template_id: z.string().uuid().optional(),
  subject: z.string().min(1).max(500),
  preview_text: z.string().max(500).optional(),
  from_name: z.string().min(1).max(255),
  from_email: z.string().email(),
  reply_to: z.string().email().optional(),
  html_content: z.string().min(1),
  text_content: z.string().optional(),
  audience_type: z.enum(['all', 'segment', 'list', 'manual']).default('segment'),
  audience_segment_id: z.string().uuid().optional(),
  audience_list_ids: z.array(z.string().uuid()).optional(),
  audience_filters: z.record(z.unknown()).optional(),
  scheduled_at: z.string().optional(),
  is_ab_test: z.boolean().default(false),
  ab_test_config: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const campaign_type = searchParams.get('campaign_type');
    const event_id = searchParams.get('event_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('email_campaigns')
      .select(`
        *,
        template:email_templates(id, name, thumbnail_url),
        event:events(id, name),
        creator:platform_users!created_by(id, full_name)
      `, { count: 'exact' })
      .eq('organization_id', platformUser.organization_id);

    if (status) {
      query = query.eq('status', status);
    }
    if (campaign_type) {
      query = query.eq('campaign_type', campaign_type);
    }
    if (event_id) {
      query = query.eq('event_id', event_id);
    }

    const { data, error, count } = await query
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
    console.error('Get email campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
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

    const isMarketing = platformUser.platform_roles?.some((role: string) =>
      ['GVTEWAY_ADMIN', 'GVTEWAY_MARKETING_MANAGER', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isMarketing) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = campaignSchema.parse(body);

    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({
        organization_id: platformUser.organization_id,
        ...validated,
        audience_list_ids: validated.audience_list_ids || [],
        audience_filters: validated.audience_filters || {},
        status: validated.scheduled_at ? 'scheduled' : 'draft',
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
    console.error('Create email campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
