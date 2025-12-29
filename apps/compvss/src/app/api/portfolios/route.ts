export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createPortfolioSchema = z.object({
  action: z.literal('create'),
  vendor_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  specialties: z.array(z.string()).optional(),
});

const addItemSchema = z.object({
  action: z.literal('add_item'),
  portfolio_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  media_url: z.string().url().optional(),
  media_type: z.string().optional(),
  project_date: z.string().optional(),
  client: z.string().optional(),
  role: z.string().optional(),
});

const portfolioActionSchema = z.union([createPortfolioSchema, addItemSchema]);

// Portfolio and past work showcase
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
    const userId = searchParams.get('user_id');
    const vendorId = searchParams.get('vendor_id');

    let query = supabase.from('portfolios').select(`
      *, items:portfolio_items(id, title, description, media_url, media_type, project_date)
    `);

    if (userId) query = query.eq('user_id', userId);
    if (vendorId) query = query.eq('vendor_id', vendorId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ portfolios: data });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = portfolioActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { vendor_id, title, description, specialties } = validatedData as z.infer<typeof createPortfolioSchema>;

      const { data, error } = await supabase.from('portfolios').insert({
        user_id: vendor_id ? null : user.id, vendor_id,
        title, description, specialties: specialties || []
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ portfolio: data }, { status: 201 });
    }

    if (action === 'add_item') {
      const { portfolio_id, title, description, media_url, media_type, project_date, client, role } = validatedData as z.infer<typeof addItemSchema>;

      const { data, error } = await supabase.from('portfolio_items').insert({
        portfolio_id, title, description, media_url, media_type, project_date, client, role
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ item: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
