import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const CompetitorSchema = z.object({
  name: z.string(),
  website: z.string().optional(),
  industry: z.string(),
  description: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  market_share: z.number().optional(),
  pricing_tier: z.enum(['budget', 'mid-market', 'premium', 'enterprise']).optional(),
});

// GET /api/ai/competitive-intelligence - Competitive intelligence and market analysis
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'dashboard') {
      // Get competitor overview
      const { data: competitors } = await supabase
        .from('competitors')
        .select('*')
        .eq('is_active', true)
        .order('market_share', { ascending: false });

      // Get recent intelligence updates
      const { data: recentUpdates } = await supabase
        .from('competitive_updates')
        .select(`
          *,
          competitor:competitors(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get market trends
      const { data: trends } = await supabase
        .from('market_trends')
        .select('*')
        .eq('is_active', true)
        .order('impact_score', { ascending: false })
        .limit(5);

      return NextResponse.json({
        competitors: competitors || [],
        recent_updates: recentUpdates || [],
        market_trends: trends || [],
        summary: {
          total_competitors: competitors?.length || 0,
          avg_market_share: competitors?.length
            ? (competitors.reduce((sum, c) => sum + (c.market_share || 0), 0) / competitors.length).toFixed(1)
            : 0,
        },
      });
    }

    if (action === 'competitor_profile') {
      const competitorId = searchParams.get('competitor_id');
      if (!competitorId) {
        return NextResponse.json({ error: 'Competitor ID required' }, { status: 400 });
      }

      const { data: competitor } = await supabase
        .from('competitors')
        .select('*')
        .eq('id', competitorId)
        .single();

      if (!competitor) {
        return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
      }

      // Get updates history
      const { data: updates } = await supabase
        .from('competitive_updates')
        .select('*')
        .eq('competitor_id', competitorId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Get pricing comparison
      const { data: pricing } = await supabase
        .from('competitor_pricing')
        .select('*')
        .eq('competitor_id', competitorId)
        .order('updated_at', { ascending: false });

      // Get feature comparison
      const { data: features } = await supabase
        .from('competitor_features')
        .select('*')
        .eq('competitor_id', competitorId);

      return NextResponse.json({
        competitor,
        updates: updates || [],
        pricing: pricing || [],
        features: features || [],
      });
    }

    if (action === 'market_analysis') {
      // Get market size and growth data
      const { data: marketData } = await supabase
        .from('market_data')
        .select('*')
        .order('period', { ascending: false })
        .limit(12);

      // Get segment analysis
      const { data: segments } = await supabase
        .from('market_segments')
        .select('*')
        .eq('is_active', true);

      // Calculate market metrics
      const latestData = marketData?.[0];
      const previousData = marketData?.[1];

      const growth = latestData && previousData
        ? ((latestData.market_size - previousData.market_size) / previousData.market_size * 100)
        : 0;

      return NextResponse.json({
        market_size: latestData?.market_size || 0,
        growth_rate: growth.toFixed(1),
        historical_data: marketData || [],
        segments: segments || [],
      });
    }

    if (action === 'swot_analysis') {
      // Get our strengths/weaknesses
      const { data: internal } = await supabase
        .from('swot_analysis')
        .select('*')
        .eq('type', 'internal')
        .order('impact_score', { ascending: false });

      // Get opportunities/threats
      const { data: external } = await supabase
        .from('swot_analysis')
        .select('*')
        .eq('type', 'external')
        .order('impact_score', { ascending: false });

      return NextResponse.json({
        strengths: internal?.filter(i => i.category === 'strength') || [],
        weaknesses: internal?.filter(i => i.category === 'weakness') || [],
        opportunities: external?.filter(e => e.category === 'opportunity') || [],
        threats: external?.filter(e => e.category === 'threat') || [],
      });
    }

    if (action === 'pricing_comparison') {
      // Get all competitor pricing
      const { data: pricing } = await supabase
        .from('competitor_pricing')
        .select(`
          *,
          competitor:competitors(name)
        `)
        .order('product_category');

      // Get our pricing
      const { data: ourPricing } = await supabase
        .from('products')
        .select('name, category, price')
        .eq('is_active', true);

      // Group by category
      const categories: Record<string, any[]> = {};
      pricing?.forEach(p => {
        const cat = p.product_category || 'other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({
          competitor: (p.competitor as any)?.name,
          price: p.price,
          features: p.features,
        });
      });

      return NextResponse.json({
        competitor_pricing: categories,
        our_pricing: ourPricing || [],
        positioning: analyzePositioning(pricing || [], ourPricing || []),
      });
    }

    if (action === 'win_loss_analysis') {
      // Get won deals
      const { data: wonDeals } = await supabase
        .from('deals')
        .select('id, value, competitor_id, win_reason')
        .eq('stage', 'closed_won')
        .gte('closed_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

      // Get lost deals
      const { data: lostDeals } = await supabase
        .from('deals')
        .select('id, value, competitor_id, loss_reason')
        .eq('stage', 'closed_lost')
        .gte('closed_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

      // Analyze by competitor
      const competitorWinLoss: Record<string, { wins: number; losses: number; win_value: number; loss_value: number }> = {};

      wonDeals?.forEach(d => {
        const compId = d.competitor_id || 'none';
        if (!competitorWinLoss[compId]) competitorWinLoss[compId] = { wins: 0, losses: 0, win_value: 0, loss_value: 0 };
        competitorWinLoss[compId].wins++;
        competitorWinLoss[compId].win_value += d.value || 0;
      });

      lostDeals?.forEach(d => {
        const compId = d.competitor_id || 'none';
        if (!competitorWinLoss[compId]) competitorWinLoss[compId] = { wins: 0, losses: 0, win_value: 0, loss_value: 0 };
        competitorWinLoss[compId].losses++;
        competitorWinLoss[compId].loss_value += d.value || 0;
      });

      // Analyze reasons
      const winReasons: Record<string, number> = {};
      const lossReasons: Record<string, number> = {};

      wonDeals?.forEach(d => {
        if (d.win_reason) {
          winReasons[d.win_reason] = (winReasons[d.win_reason] || 0) + 1;
        }
      });

      lostDeals?.forEach(d => {
        if (d.loss_reason) {
          lossReasons[d.loss_reason] = (lossReasons[d.loss_reason] || 0) + 1;
        }
      });

      return NextResponse.json({
        summary: {
          total_wins: wonDeals?.length || 0,
          total_losses: lostDeals?.length || 0,
          win_rate: wonDeals && lostDeals
            ? ((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100).toFixed(1)
            : 0,
          total_won_value: wonDeals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
          total_lost_value: lostDeals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
        },
        by_competitor: Object.entries(competitorWinLoss).map(([id, data]) => ({
          competitor_id: id,
          ...data,
          win_rate: ((data.wins / (data.wins + data.losses)) * 100).toFixed(1),
        })),
        win_reasons: Object.entries(winReasons)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count),
        loss_reasons: Object.entries(lossReasons)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a, b) => b.count - a.count),
      });
    }

    if (action === 'alerts') {
      // Get competitive alerts
      const { data: alerts } = await supabase
        .from('competitive_alerts')
        .select(`
          *,
          competitor:competitors(name)
        `)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      return NextResponse.json({ alerts: alerts || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch competitive intelligence' }, { status: 500 });
  }
}

// POST /api/ai/competitive-intelligence - Add competitors or updates
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'add_competitor';

    if (action === 'add_competitor') {
      const validated = CompetitorSchema.parse(body);

      const { data: competitor, error } = await supabase
        .from('competitors')
        .insert({
          ...validated,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ competitor }, { status: 201 });
    } else if (action === 'add_update') {
      const { competitor_id, update_type, title, content, source, impact } = body;

      const { data: update, error } = await supabase
        .from('competitive_updates')
        .insert({
          competitor_id,
          update_type,
          title,
          content,
          source,
          impact,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ update }, { status: 201 });
    } else if (action === 'add_pricing') {
      const { competitor_id, product_category, price, features, notes } = body;

      const { data: pricing, error } = await supabase
        .from('competitor_pricing')
        .upsert({
          competitor_id,
          product_category,
          price,
          features,
          notes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'competitor_id,product_category' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ pricing });
    } else if (action === 'add_swot_item') {
      const { type, category, description, impact_score } = body;

      const { data: item, error } = await supabase
        .from('swot_analysis')
        .insert({
          type,
          category,
          description,
          impact_score,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ item }, { status: 201 });
    } else if (action === 'create_alert') {
      const { competitor_id, alert_type, title, description, priority } = body;

      const { data: alert, error } = await supabase
        .from('competitive_alerts')
        .insert({
          competitor_id,
          alert_type,
          title,
          description,
          priority,
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ alert }, { status: 201 });
    } else if (action === 'log_deal_outcome') {
      const { deal_id, outcome, competitor_id, reason } = body;

      const updateData: any = {
        stage: outcome === 'won' ? 'closed_won' : 'closed_lost',
        closed_at: new Date().toISOString(),
        competitor_id,
      };

      if (outcome === 'won') {
        updateData.win_reason = reason;
      } else {
        updateData.loss_reason = reason;
      }

      const { error } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', deal_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function
function analyzePositioning(competitorPricing: any[], ourPricing: any[]): any {
  const avgCompetitorPrice = competitorPricing.length > 0
    ? competitorPricing.reduce((sum, p) => sum + (p.price || 0), 0) / competitorPricing.length
    : 0;

  const avgOurPrice = ourPricing.length > 0
    ? ourPricing.reduce((sum, p) => sum + (p.price || 0), 0) / ourPricing.length
    : 0;

  let position = 'mid-market';
  if (avgOurPrice > avgCompetitorPrice * 1.2) position = 'premium';
  else if (avgOurPrice < avgCompetitorPrice * 0.8) position = 'budget';

  return {
    our_average_price: avgOurPrice,
    competitor_average_price: avgCompetitorPrice,
    price_difference_percent: avgCompetitorPrice > 0
      ? (((avgOurPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100).toFixed(1)
      : 0,
    market_position: position,
  };
}
