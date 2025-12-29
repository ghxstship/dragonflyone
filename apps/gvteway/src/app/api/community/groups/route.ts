export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  type: z.enum(['public', 'private', 'secret']),
  category: z.string().max(50).optional(),
  rules: z.string().max(5000).optional(),
  banner_url: z.string().url().optional(),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const type = searchParams.get('type');

    let query = supabaseAdmin
      .from('community_groups')
      .select(`
        *,
        creator:platform_users!community_groups_created_by_fkey(id, full_name),
        members:community_group_members(count)
      `);

    if (category) {
      query = query.eq('category', category);
    }

    if (type) {
      query = query.eq('group_type', type);
    } else {
      query = query.in('group_type', ['public', 'private']);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: groups, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch groups', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ groups: groups || [] });
  },
  {
    auth: false,
    audit: { action: 'groups:list', resource: 'community_groups' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context) => {
    const body = await request.json();
    const data = createGroupSchema.parse(body);

    if (!context.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data: group, error } = await supabaseAdmin
      .from('community_groups')
      .insert({
        name: data.name,
        description: data.description,
        group_type: data.type,
        category: data.category,
        rules: data.rules,
        cover_image: data.banner_url,
        slug,
        created_by: context.user.id,
      })
      .select()
      .single();

    if (error || !group) {
      return NextResponse.json(
        { error: 'Failed to create group', message: error?.message },
        { status: 500 }
      );
    }

    await supabaseAdmin.from('community_group_members').insert({
      group_id: group.id,
      user_id: context.user.id,
      role: 'admin',
    });

    return NextResponse.json({ group }, { status: 201 });
  },
  {
    auth: true,
    validation: createGroupSchema,
    audit: { action: 'group:create', resource: 'community_groups' },
  }
);
