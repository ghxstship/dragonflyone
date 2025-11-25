import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';

const createCommentSchema = z.object({
  resource_type: z.enum(['project', 'task', 'asset', 'event', 'ticket', 'order']),
  resource_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  parent_id: z.string().uuid().optional(),
  mentions: z.array(z.string().uuid()).optional(),
});

export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get('resource_type');
    const resourceId = searchParams.get('resource_id');

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'resource_type and resource_id are required' },
        { status: 400 }
      );
    }

    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        author:platform_users!comments_author_id_fkey(id, full_name, email),
        replies:comments!comments_parent_id_fkey(
          *,
          author:platform_users!comments_author_id_fkey(id, full_name, email)
        )
      `)
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch comments', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] });
  },
  {
    auth: true,
    audit: { action: 'comments:list', resource: 'comments' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const data = createCommentSchema.parse(body);

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({
        resource_type: data.resource_type,
        resource_id: data.resource_id,
        content: data.content,
        parent_id: data.parent_id,
        author_id: context.user.id,
      })
      .select(`
        *,
        author:platform_users!comments_author_id_fkey(id, full_name, email)
      `)
      .single();

    if (error || !comment) {
      return NextResponse.json(
        { error: 'Failed to create comment', message: error?.message },
        { status: 500 }
      );
    }

    if (data.mentions && data.mentions.length > 0) {
      const notifications = data.mentions.map(userId => ({
        recipient_id: userId,
        sender_id: context.user.id,
        title: 'You were mentioned in a comment',
        message: `${context.user.full_name} mentioned you: ${data.content.substring(0, 100)}...`,
        type: 'info',
        action_url: `/app/${data.resource_type}s/${data.resource_id}#comment-${comment.id}`,
        priority: 'medium',
      }));

      await supabaseAdmin.from('notifications').insert(notifications);
    }

    return NextResponse.json({ comment }, { status: 201 });
  },
  {
    auth: true,
    validation: createCommentSchema,
    audit: { action: 'comment:create', resource: 'comments' },
  }
);
