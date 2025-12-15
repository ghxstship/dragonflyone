export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];



const bulkPostSchema = z.object({
  content: z.string().min(1),
  platforms: z.array(z.string()).min(1),
  media_urls: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  event_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'history') {
      const { data: posts, error } = await supabase
        .from('bulk_posts')
        .select(`*, results:bulk_post_results(*)`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          return NextResponse.json({ posts: [] });
        }
        throw error;
      }
      return NextResponse.json({ posts });
    }

    if (type === 'platforms') {
      const platforms = [
        { id: 'facebook', name: 'Facebook', icon: 'facebook' },
        { id: 'instagram', name: 'Instagram', icon: 'instagram' },
        { id: 'twitter', name: 'Twitter/X', icon: 'twitter' },
        { id: 'tiktok', name: 'TikTok', icon: 'tiktok' },
        { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
        { id: 'youtube', name: 'YouTube', icon: 'youtube' },
      ];
      return NextResponse.json({ platforms });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ posts: [] });
    }
    return NextResponse.json({ error: msg || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = bulkPostSchema.parse(body);
    const createdBy = body.created_by;

    // Create bulk post record
    const { data: bulkPost, error } = await supabase
      .from('bulk_posts')
      .insert({
        content: validated.content,
        platforms: validated.platforms,
        media_urls: validated.media_urls,
        hashtags: validated.hashtags,
        event_id: validated.event_id,
        status: 'processing',
        created_by: createdBy,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Simulate posting to each platform
    const results = [];
    for (const platform of validated.platforms) {
      const success = Math.random() > 0.1; // 90% success rate simulation

      const { data: result } = await supabase
        .from('bulk_post_results')
        .insert({
          bulk_post_id: bulkPost.id,
          platform,
          status: success ? 'success' : 'failed',
          post_id: success ? `${platform}_${Date.now()}` : null,
          error_message: success ? null : 'Simulated failure',
          posted_at: success ? new Date().toISOString() : null,
        })
        .select()
        .single();

      results.push(result);
    }

    // Update bulk post status
    const allSuccess = results.every(r => r?.status === 'success');
    const anySuccess = results.some(r => r?.status === 'success');

    await supabase
      .from('bulk_posts')
      .update({
        status: allSuccess ? 'completed' : anySuccess ? 'partial' : 'failed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', bulkPost.id);

    return NextResponse.json({
      bulk_post: bulkPost,
      results,
      summary: {
        total: validated.platforms.length,
        success: results.filter(r => r?.status === 'success').length,
        failed: results.filter(r => r?.status === 'failed').length,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
