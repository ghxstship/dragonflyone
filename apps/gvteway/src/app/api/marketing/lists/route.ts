import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const listSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  list_type: z.enum(['static', 'dynamic']).default('static'),
  segment_rules: z.record(z.unknown()).optional(),
});

const subscriberSchema = z.object({
  list_id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  custom_fields: z.record(z.unknown()).optional(),
  source: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
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
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('email_lists')
      .select(`
        *,
        creator:platform_users!created_by(id, full_name)
      `)
      .eq('organization_id', platformUser.organization_id)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get email lists error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const isMarketing = platformUser.platform_roles?.some((role: string) =>
      ['GVTEWAY_ADMIN', 'GVTEWAY_MARKETING_MANAGER', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isMarketing) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Check if this is a subscriber addition or list creation
    if (body.list_id && body.email) {
      // Add subscriber to list
      const validated = subscriberSchema.parse(body);
      
      const { data, error } = await supabase
        .from('email_list_subscribers')
        .upsert({
          ...validated,
          custom_fields: validated.custom_fields || {},
          status: 'subscribed',
        }, {
          onConflict: 'list_id,email',
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ data }, { status: 201 });
    } else {
      // Create new list
      const validated = listSchema.parse(body);

      const { data, error } = await supabase
        .from('email_lists')
        .insert({
          organization_id: platformUser.organization_id,
          ...validated,
          segment_rules: validated.segment_rules || {},
          created_by: platformUser.id,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ data }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Create email list error:', error);
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    );
  }
}
