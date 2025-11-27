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

const templateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  subject: z.string().min(1).max(500),
  preview_text: z.string().max(500).optional(),
  html_content: z.string().min(1),
  text_content: z.string().optional(),
  template_type: z.enum(['promotional', 'transactional', 'newsletter', 'announcement', 'reminder', 'welcome', 'confirmation', 'custom']),
  category: z.string().max(100).optional(),
  thumbnail_url: z.string().url().optional(),
  design_json: z.record(z.unknown()).optional(),
  variables: z.array(z.object({
    name: z.string(),
    default_value: z.string().optional(),
    required: z.boolean().default(false),
  })).optional(),
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
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const template_type = searchParams.get('template_type');
    const category = searchParams.get('category');

    let query = supabase
      .from('email_templates')
      .select(`
        *,
        creator:platform_users!created_by(id, full_name)
      `)
      .eq('organization_id', platformUser.organization_id)
      .eq('is_active', true);

    if (template_type) {
      query = query.eq('template_type', template_type);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get email templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
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
    const validated = templateSchema.parse(body);

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        organization_id: platformUser.organization_id,
        ...validated,
        variables: validated.variables || [],
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
    console.error('Create email template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
