export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

const createCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  campaign_type: z.enum(['email', 'social', 'paid_ads', 'content', 'influencer', 'event', 'partnership', 'other']),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().optional(),
  target_audience: z.string().optional(),
  goals: z.string().optional(),
  channels: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const campaignType = searchParams.get('campaign_type');

    let query = supabase
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (campaignType) {
      query = query.eq('campaign_type', campaignType);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching marketing campaigns:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    logger.error('Error in GET /api/marketing/campaigns:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - ATLVS access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createCampaignSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: validationResult.error.errors }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert(validationResult.data)
      .select()
      .single();

    if (error) {
      logger.error('Error creating marketing campaign:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/marketing/campaigns:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
