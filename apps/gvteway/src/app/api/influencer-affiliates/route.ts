export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Schema for creating affiliates - uses 3NF tables from 0051 migration
const affiliateSchema = z.object({
  person_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  affiliate_type: z.enum(['influencer', 'ambassador', 'partner', 'affiliate']).default('influencer'),
  commission_rate: z.number().min(0).max(50).default(10),
  tier: z.enum(['standard', 'silver', 'gold', 'platinum']).default('standard'),
  social_links: z.record(z.string()).optional(),
});

// GET /api/influencer-affiliates - List affiliates from influencer_affiliates (3NF table)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliate_id');
    const code = searchParams.get('code');
    const type = searchParams.get('type');

    // Dashboard view for specific affiliate
    if (type === 'dashboard' && affiliateId) {
      const { data: affiliate } = await supabase
        .from('influencer_affiliates')
        .select(`
          *,
          person:legend_people!person_id(id, display_name, avatar_url, email)
        `)
        .eq('id', affiliateId)
        .single();

      const { data: conversions } = await supabase
        .from('affiliate_conversions')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      const stats = {
        total_clicks: affiliate?.total_clicks || 0,
        total_conversions: affiliate?.total_conversions || 0,
        total_revenue: affiliate?.total_revenue || 0,
        total_commission: affiliate?.total_commission || 0,
        conversion_rate: affiliate?.total_clicks > 0 
          ? ((affiliate?.total_conversions || 0) / affiliate.total_clicks * 100).toFixed(2) 
          : 0,
      };

      return NextResponse.json({ affiliate, conversions, stats });
    }

    // Lookup by affiliate code
    if (code) {
      const { data: affiliate, error } = await supabase
        .from('influencer_affiliates')
        .select(`
          id,
          affiliate_code,
          commission_rate,
          person:legend_people!person_id(id, display_name)
        `)
        .eq('affiliate_code', code)
        .eq('status', 'active')
        .single();

      if (error) {
        logger.error('Error fetching affiliate by code:', error);
        return NextResponse.json({ affiliate: null });
      }
      return NextResponse.json({ affiliate });
    }

    // Leaderboard
    if (type === 'leaderboard') {
      const { data: affiliates } = await supabase
        .from('influencer_affiliates')
        .select(`
          id,
          tier,
          total_clicks,
          total_conversions,
          total_revenue,
          person:legend_people!person_id(id, display_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('total_revenue', { ascending: false })
        .limit(20);

      return NextResponse.json({ leaderboard: affiliates });
    }

    // Default: list all affiliates
    const { data: affiliates, error } = await supabase
      .from('influencer_affiliates')
      .select(`
        *,
        person:legend_people!person_id(id, display_name, avatar_url, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching affiliates:', error);
      return NextResponse.json({ affiliates: [] });
    }
    return NextResponse.json({ affiliates: affiliates || [] });
  } catch (error) {
    logger.error('Error in GET /api/influencer-affiliates:', error instanceof Error ? error : undefined);
    return NextResponse.json({ affiliates: [] });
  }
}

// POST /api/influencer-affiliates - Create affiliate or track actions using 3NF tables
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'create') {
      const validated = affiliateSchema.parse(body.data);

      // Generate unique affiliate code
      const affiliateCode = `AFF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      const { data: affiliate, error } = await supabase
        .from('influencer_affiliates')
        .insert({
          organization_id: validated.organization_id,
          person_id: validated.person_id,
          affiliate_code: affiliateCode,
          affiliate_type: validated.affiliate_type,
          commission_rate: validated.commission_rate,
          tier: validated.tier,
          social_links: validated.social_links || {},
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating affiliate:', error);
        return NextResponse.json({ error: 'Failed to create affiliate', details: error.message }, { status: 500 });
      }

      return NextResponse.json({
        affiliate,
        tracking_link: `/ref/${affiliateCode}`,
      }, { status: 201 });
    }

    if (action === 'track_click') {
      const { code, event_id, source_url, landing_url } = body.data;

      const { data: affiliate } = await supabase
        .from('influencer_affiliates')
        .select('id')
        .eq('affiliate_code', code)
        .eq('status', 'active')
        .single();

      if (!affiliate) {
        return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 });
      }

      // Log click in affiliate_clicks (3NF table)
      await supabase.from('affiliate_clicks').insert({
        affiliate_id: affiliate.id,
        event_id,
        source_url,
        landing_url,
        ip_address: request.headers.get('x-forwarded-for') || null,
        user_agent: request.headers.get('user-agent') || null,
        referrer: request.headers.get('referer') || null,
      });

      // Increment total clicks using helper function
      await supabase.rpc('increment_affiliate_clicks', { p_affiliate_id: affiliate.id });

      return NextResponse.json({ tracked: true });
    }

    if (action === 'record_conversion') {
      const { affiliate_code, order_id, order_amount, click_id } = body.data;

      const { data: affiliate } = await supabase
        .from('influencer_affiliates')
        .select('id, commission_rate')
        .eq('affiliate_code', affiliate_code)
        .single();

      if (!affiliate) {
        return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 });
      }

      const commissionAmount = order_amount * (affiliate.commission_rate / 100);

      // Record conversion in affiliate_conversions (3NF table)
      const { data: conversion, error } = await supabase
        .from('affiliate_conversions')
        .insert({
          affiliate_id: affiliate.id,
          click_id,
          order_id,
          conversion_type: 'sale',
          order_amount,
          commission_amount: commissionAmount,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        logger.error('Error recording conversion:', error);
        return NextResponse.json({ error: 'Failed to record conversion' }, { status: 500 });
      }

      // Update affiliate stats using helper function
      await supabase.rpc('record_affiliate_conversion', {
        p_affiliate_id: affiliate.id,
        p_order_amount: order_amount,
        p_commission_amount: commissionAmount,
      });

      return NextResponse.json({ conversion }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/influencer-affiliates:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/influencer-affiliates - Update affiliate using 3NF table
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data: affiliate, error } = await supabase
      .from('influencer_affiliates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating affiliate:', error);
      return NextResponse.json({ error: 'Failed to update affiliate' }, { status: 500 });
    }

    return NextResponse.json({ affiliate });
  } catch (error) {
    logger.error('Error in PATCH /api/influencer-affiliates:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
