import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const affiliateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  social_handles: z.record(z.string()).optional(),
  commission_rate: z.number().min(0).max(50),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliate_id');
    const code = searchParams.get('code');
    const type = searchParams.get('type');

    if (type === 'dashboard' && affiliateId) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', affiliateId)
        .single();

      const { data: conversions } = await supabase
        .from('affiliate_conversions')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('converted_at', { ascending: false });

      const stats = {
        total_clicks: affiliate?.total_clicks || 0,
        total_conversions: conversions?.length || 0,
        total_revenue: conversions?.reduce((sum, c) => sum + c.order_amount, 0) || 0,
        total_commission: conversions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0,
        conversion_rate: affiliate?.total_clicks > 0 
          ? ((conversions?.length || 0) / affiliate.total_clicks * 100).toFixed(2) 
          : 0,
      };

      return NextResponse.json({ affiliate, conversions, stats });
    }

    if (code) {
      const { data: affiliate, error } = await supabase
        .from('affiliates')
        .select('id, name, code, commission_rate')
        .eq('code', code)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return NextResponse.json({ affiliate });
    }

    if (type === 'leaderboard') {
      const { data: affiliates } = await supabase
        .from('affiliates')
        .select('id, name, tier, total_clicks, total_conversions, total_revenue')
        .eq('status', 'active')
        .order('total_revenue', { ascending: false })
        .limit(20);

      return NextResponse.json({ leaderboard: affiliates });
    }

    const { data: affiliates, error } = await supabase
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ affiliates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create') {
      const validated = affiliateSchema.parse(body.data);

      // Generate unique code
      const code = `${validated.name.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data: affiliate, error } = await supabase
        .from('affiliates')
        .insert({
          ...validated,
          code,
          status: 'active',
          total_clicks: 0,
          total_conversions: 0,
          total_revenue: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({
        affiliate,
        tracking_link: `/ref/${code}`,
      }, { status: 201 });
    }

    if (action === 'track_click') {
      const { code, event_id, source } = body.data;

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, total_clicks')
        .eq('code', code)
        .single();

      if (!affiliate) return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 });

      // Log click
      await supabase.from('affiliate_clicks').insert({
        affiliate_id: affiliate.id,
        event_id,
        source,
        clicked_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      });

      // Update total clicks
      await supabase
        .from('affiliates')
        .update({ total_clicks: (affiliate.total_clicks || 0) + 1 })
        .eq('id', affiliate.id);

      return NextResponse.json({ tracked: true });
    }

    if (action === 'record_conversion') {
      const { affiliate_code, order_id, order_amount } = body.data;

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id, commission_rate, total_conversions, total_revenue')
        .eq('code', affiliate_code)
        .single();

      if (!affiliate) return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 });

      const commissionAmount = order_amount * (affiliate.commission_rate / 100);

      const { data: conversion, error } = await supabase
        .from('affiliate_conversions')
        .insert({
          affiliate_id: affiliate.id,
          order_id,
          order_amount,
          commission_amount: commissionAmount,
          status: 'pending',
          converted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update affiliate stats
      await supabase
        .from('affiliates')
        .update({
          total_conversions: (affiliate.total_conversions || 0) + 1,
          total_revenue: (affiliate.total_revenue || 0) + order_amount,
        })
        .eq('id', affiliate.id);

      return NextResponse.json({ conversion }, { status: 201 });
    }

    if (action === 'payout') {
      const { affiliate_id, amount, payment_method } = body.data;

      const { data: payout, error } = await supabase
        .from('affiliate_payouts')
        .insert({
          affiliate_id,
          amount,
          payment_method,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Mark conversions as paid
      await supabase
        .from('affiliate_conversions')
        .update({ status: 'paid', payout_id: payout.id })
        .eq('affiliate_id', affiliate_id)
        .eq('status', 'pending');

      return NextResponse.json({ payout }, { status: 201 });
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
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ affiliate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
