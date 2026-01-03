export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { logger } from '@ghxstship/config';

// Schema for creating groups (stored in social_groups - 3NF table)
const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  type: z.enum(['public', 'private', 'secret']),
  category: z.string().max(50).optional(),
  rules: z.string().max(5000).optional(),
  banner_url: z.string().url().optional(),
  organization_id: z.string().uuid(),
});

// GET /api/community/groups - List groups from social_groups (3NF table)
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const type = searchParams.get('type');

    // Query social_groups - the 3NF table for community groups
    let query = supabaseAdmin
      .from('social_groups')
      .select(`
        *,
        creator:legend_people!created_by(id, display_name, avatar_url),
        members:social_group_members(count)
      `)
      .eq('is_active', true);

    if (category) {
      query = query.eq('group_type', category);
    }

    if (type) {
      query = query.eq('is_public', type === 'public');
    } else {
      query = query.eq('is_public', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: groups, error } = await query.order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching groups from social_groups:', error);
      return NextResponse.json({ groups: [] });
    }

    return NextResponse.json({ groups: groups || [] });
  },
  {
    auth: false,
    audit: { action: 'groups:list', resource: 'social_groups' },
  }
);

// POST /api/community/groups - Create group in social_groups (3NF table)
export const POST = apiRoute(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const data = createGroupSchema.parse(body);

    if (!context.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the person_id for the current user
    const { data: personData } = await supabaseAdmin
      .from('legend_people')
      .select('id')
      .eq('platform_user_id', context.user.id)
      .single();

    if (!personData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data: group, error } = await supabaseAdmin
      .from('social_groups')
      .insert({
        organization_id: data.organization_id,
        name: data.name,
        description: data.description,
        group_type: data.category || 'interest',
        is_public: data.type === 'public',
        rules: data.rules,
        cover_image_url: data.banner_url,
        slug,
        created_by: personData.id,
        is_active: true,
      })
      .select()
      .single();

    if (error || !group) {
      logger.error('Error creating group in social_groups:', error);
      return NextResponse.json(
        { error: 'Failed to create group', message: error?.message },
        { status: 500 }
      );
    }

    // Add creator as admin member
    await supabaseAdmin.from('social_group_members').insert({
      group_id: group.id,
      person_id: personData.id,
      role: 'admin',
      is_active: true,
    });

    return NextResponse.json({ group }, { status: 201 });
  },
  {
    auth: true,
    validation: createGroupSchema,
    audit: { action: 'group:create', resource: 'social_groups' },
  }
);
