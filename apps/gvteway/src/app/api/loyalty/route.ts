import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const earnPointsSchema = z.object({
  user_id: z.string().uuid(),
  points: z.number().int().positive(),
  source: z.string(),
  source_id: z.string().uuid().optional(),
  description: z.string().optional(),
});

const redeemPointsSchema = z.object({
  user_id: z.string().uuid(),
  reward_id: z.string().uuid(),
});

// GET /api/loyalty - Get user's loyalty data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    if (type === 'balance') {
      const { data: balance, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Failed to fetch balance', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        balance: balance || {
          points_balance: 0,
          lifetime_points: 0,
          tier: 'bronze',
          tier_points: 0,
        },
      });
    }

    if (type === 'transactions') {
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const { data: transactions, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch transactions', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ transactions });
    }

    if (type === 'rewards') {
      const { data: balance } = await supabase
        .from('loyalty_points')
        .select('tier, points_balance')
        .eq('user_id', userId)
        .single();

      const userTier = balance?.tier || 'bronze';
      const userPoints = balance?.points_balance || 0;

      const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      const userTierIndex = tierOrder.indexOf(userTier);

      const { data: rewards, error } = await supabase
        .from('rewards_catalog')
        .select('*')
        .eq('is_active', true)
        .or(`tier_required.is.null,tier_required.in.(${tierOrder.slice(0, userTierIndex + 1).join(',')})`)
        .order('points_required', { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch rewards', details: error.message },
          { status: 500 }
        );
      }

      const availableRewards = rewards?.map(r => ({
        ...r,
        can_redeem: userPoints >= r.points_required,
        points_needed: Math.max(0, r.points_required - userPoints),
      }));

      return NextResponse.json({ rewards: availableRewards, user_points: userPoints });
    }

    // Default: return all loyalty data
    const [balanceRes, transactionsRes, rewardsRes] = await Promise.all([
      supabase.from('loyalty_points').select('*').eq('user_id', userId).single(),
      supabase.from('loyalty_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('rewards_catalog').select('*').eq('is_active', true).order('points_required', { ascending: true }),
    ]);

    return NextResponse.json({
      balance: balanceRes.data || { points_balance: 0, lifetime_points: 0, tier: 'bronze' },
      recent_transactions: transactionsRes.data || [],
      available_rewards: rewardsRes.data || [],
    });
  } catch (error) {
    console.error('Error in GET /api/loyalty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/loyalty - Earn or redeem points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'earn') {
      const validated = earnPointsSchema.parse(body);

      // Get or create loyalty account
      let { data: account } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', validated.user_id)
        .single();

      if (!account) {
        const { data: newAccount, error: createError } = await supabase
          .from('loyalty_points')
          .insert({ user_id: validated.user_id })
          .select()
          .single();

        if (createError) {
          return NextResponse.json(
            { error: 'Failed to create loyalty account', details: createError.message },
            { status: 500 }
          );
        }
        account = newAccount;
      }

      const newBalance = (account.points_balance || 0) + validated.points;
      const newLifetime = (account.lifetime_points || 0) + validated.points;
      const newTierPoints = (account.tier_points || 0) + validated.points;

      // Calculate new tier
      const newTier = calculateTier(newTierPoints);

      // Update balance
      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          points_balance: newBalance,
          lifetime_points: newLifetime,
          tier_points: newTierPoints,
          tier: newTier,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', validated.user_id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update balance', details: updateError.message },
          { status: 500 }
        );
      }

      // Record transaction
      await supabase.from('loyalty_transactions').insert({
        user_id: validated.user_id,
        transaction_type: 'earn',
        points: validated.points,
        balance_after: newBalance,
        source: validated.source,
        source_id: validated.source_id,
        description: validated.description,
      });

      return NextResponse.json({
        success: true,
        points_earned: validated.points,
        new_balance: newBalance,
        tier: newTier,
      });
    }

    if (action === 'redeem') {
      const validated = redeemPointsSchema.parse(body);

      // Get reward
      const { data: reward, error: rewardError } = await supabase
        .from('rewards_catalog')
        .select('*')
        .eq('id', validated.reward_id)
        .eq('is_active', true)
        .single();

      if (rewardError || !reward) {
        return NextResponse.json({ error: 'Reward not found or inactive' }, { status: 404 });
      }

      // Get user balance
      const { data: account } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', validated.user_id)
        .single();

      if (!account || account.points_balance < reward.points_required) {
        return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
      }

      // Check tier requirement
      if (reward.tier_required) {
        const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
        if (tierOrder.indexOf(account.tier) < tierOrder.indexOf(reward.tier_required)) {
          return NextResponse.json({ error: 'Tier requirement not met' }, { status: 400 });
        }
      }

      // Check availability
      if (reward.quantity_available !== null && reward.quantity_redeemed >= reward.quantity_available) {
        return NextResponse.json({ error: 'Reward no longer available' }, { status: 400 });
      }

      const newBalance = account.points_balance - reward.points_required;

      // Update balance
      await supabase
        .from('loyalty_points')
        .update({
          points_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', validated.user_id);

      // Update reward quantity
      await supabase
        .from('rewards_catalog')
        .update({
          quantity_redeemed: (reward.quantity_redeemed || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validated.reward_id);

      // Record transaction
      await supabase.from('loyalty_transactions').insert({
        user_id: validated.user_id,
        transaction_type: 'redeem',
        points: -reward.points_required,
        balance_after: newBalance,
        source: 'reward_redemption',
        source_id: validated.reward_id,
        description: `Redeemed: ${reward.name}`,
      });

      return NextResponse.json({
        success: true,
        reward_redeemed: reward.name,
        points_spent: reward.points_required,
        new_balance: newBalance,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/loyalty:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateTier(tierPoints: number): string {
  if (tierPoints >= 50000) return 'diamond';
  if (tierPoints >= 25000) return 'platinum';
  if (tierPoints >= 10000) return 'gold';
  if (tierPoints >= 2500) return 'silver';
  return 'bronze';
}
