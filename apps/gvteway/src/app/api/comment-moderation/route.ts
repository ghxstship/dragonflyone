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

const filterSchema = z.object({
  name: z.string().min(1),
  keywords: z.array(z.string()),
  action: z.enum(['flag', 'hide', 'delete', 'notify']),
  platforms: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (type === 'filters') {
      const { data: filters, error } = await supabase
        .from('comment_filters')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return NextResponse.json({ filters });
    }

    if (type === 'flagged') {
      let query = supabase
        .from('flagged_comments')
        .select('*')
        .order('flagged_at', { ascending: false });

      if (status) query = query.eq('status', status);

      const { data: comments, error } = await query.limit(100);
      if (error) throw error;

      return NextResponse.json({ flagged_comments: comments });
    }

    if (type === 'stats') {
      const { data: flagged } = await supabase
        .from('flagged_comments')
        .select('status')
        .gte('flagged_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const stats = {
        total_flagged: flagged?.length || 0,
        pending: flagged?.filter(c => c.status === 'pending').length || 0,
        approved: flagged?.filter(c => c.status === 'approved').length || 0,
        removed: flagged?.filter(c => c.status === 'removed').length || 0,
      };

      return NextResponse.json({ stats });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create_filter') {
      const validated = filterSchema.parse(body.data);

      const { data: filter, error } = await supabase
        .from('comment_filters')
        .insert({ ...validated, status: 'active', created_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ filter }, { status: 201 });
    }

    if (action === 'flag_comment') {
      const { comment_id, platform, content, reason, matched_keywords } = body.data;

      const { data: flagged, error } = await supabase
        .from('flagged_comments')
        .insert({
          comment_id,
          platform,
          content,
          reason,
          matched_keywords,
          status: 'pending',
          flagged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ flagged }, { status: 201 });
    }

    if (action === 'check_content') {
      const { content } = body;

      const { data: filters } = await supabase
        .from('comment_filters')
        .select('keywords, action')
        .eq('status', 'active');

      const matches: string[] = [];
      let suggestedAction = null;

      filters?.forEach(filter => {
        filter.keywords.forEach((keyword: string) => {
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            matches.push(keyword);
            suggestedAction = filter.action;
          }
        });
      });

      return NextResponse.json({
        flagged: matches.length > 0,
        matched_keywords: matches,
        suggested_action: suggestedAction,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, action, moderated_by } = body;

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('flagged_comments')
        .update({ status: 'approved', moderated_by, moderated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ comment: data });
    }

    if (action === 'remove') {
      const { data, error } = await supabase
        .from('flagged_comments')
        .update({ status: 'removed', moderated_by, moderated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ comment: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
