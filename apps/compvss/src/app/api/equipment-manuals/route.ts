export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const videoSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  duration: z.number().min(0).optional(),
});

const createManualSchema = z.object({
  equipment_id: z.string().uuid(),
  title: z.string().min(1),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  category: z.enum(['operation', 'maintenance', 'safety', 'troubleshooting', 'setup']),
  pdf_url: z.string().url().optional(),
  quick_start_url: z.string().url().optional(),
  videos: z.array(videoSchema).optional(),
});

// Equipment operation manuals with video tutorials
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get('equipment_id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase.from('equipment_manuals').select(`
      *, videos:manual_videos(id, title, url, duration_seconds)
    `);

    if (equipmentId) query = query.eq('equipment_id', equipmentId);
    if (category) query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,manufacturer.ilike.%${search}%`);

    const { data, error } = await query.order('title', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ manuals: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createManualSchema.parse(body);
    const { equipment_id, title, manufacturer, model, category, pdf_url, quick_start_url, videos } = validatedData;

    const { data, error } = await supabase.from('equipment_manuals').insert({
      equipment_id, title, manufacturer, model, category, pdf_url, quick_start_url
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    if (videos?.length) {
      await supabase.from('manual_videos').insert(
        videos.map((v: Record<string, unknown>) => ({ manual_id: data.id, title: v.title, url: v.url, duration_seconds: v.duration }))
      );
    }

    return NextResponse.json({ manual: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
