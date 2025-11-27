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

const RewardSchema = z.object({
  name: z.string(),
  description: z.string(),
  points_required: z.number().positive(),
  reward_type: z.enum(['discount', 'free_ticket', 'merchandise', 'experience', 'upgrade', 'early_access']),
  value: z.number().optional(),
  quantity_available: z.number().optional(),
  expiration_days: z.number().optional(),
  terms: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
});

// GET /api/loyalty-rewards - Get loyalty program data
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Some endpoints are public
    if (action === 'program_info') {
      const { data: tiers } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .eq('is_active', true)
        .order('min_points');

      const { data: featuredRewards } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(6);

      return NextResponse.json({
        program: {
          name: 'GVTEWAY Rewards',
          description: 'Earn points on every purchase and unlock exclusive rewards',
          points_per_dollar: 10,
        },
        tiers: tiers || [],
        featured_rewards: featuredRewards || [],
      });
    }

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'my_status') {
      // Get user's loyalty status
      const { data: account } = await supabase
        .from('loyalty_accounts')
        .select(`
          *,
          tier:loyalty_tiers(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (!account) {
        // Create account if doesn't exist
        const { data: newAccount } = await supabase
          .from('loyalty_accounts')
          .insert({
            user_id: user.id,
            points_balance: 0,
            lifetime_points: 0,
            tier_id: null,
          })
          .select()
          .single();

        return NextResponse.json({
          account: newAccount,
          next_tier: null,
          points_to_next_tier: 0,
        });
      }

      // Get next tier
      const { data: nextTier } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .gt('min_points', account.lifetime_points)
        .order('min_points')
        .limit(1)
        .single();

      return NextResponse.json({
        account,
        next_tier: nextTier,
        points_to_next_tier: nextTier ? nextTier.min_points - account.lifetime_points : 0,
      });
    }

    if (action === 'my_history') {
      const { data: transactions } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      return NextResponse.json({ transactions: transactions || [] });
    }

    if (action === 'my_rewards') {
      const { data: rewards } = await supabase
        .from('loyalty_redemptions')
        .select(`
          *,
          reward:loyalty_rewards(name, description, reward_type)
        `)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });

      return NextResponse.json({ rewards: rewards || [] });
    }

    if (action === 'available_rewards') {
      // Get user's points
      const { data: account } = await supabase
        .from('loyalty_accounts')
        .select('points_balance, tier_id')
        .eq('user_id', user.id)
        .single();

      const { data: rewards } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required');

      // Mark which rewards are redeemable
      const rewardsWithStatus = rewards?.map(reward => ({
        ...reward,
        can_redeem: (account?.points_balance || 0) >= reward.points_required,
        points_needed: Math.max(0, reward.points_required - (account?.points_balance || 0)),
      }));

      return NextResponse.json({
        rewards: rewardsWithStatus || [],
        current_points: account?.points_balance || 0,
      });
    }

    if (action === 'leaderboard') {
      const { data: leaderboard } = await supabase
        .from('loyalty_accounts')
        .select(`
          lifetime_points,
          user:platform_users(first_name, avatar_url)
        `)
        .order('lifetime_points', { ascending: false })
        .limit(10);

      return NextResponse.json({ leaderboard: leaderboard || [] });
    }

    // Admin actions
    if (action === 'all_rewards') {
      const { data: rewards } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .order('points_required');

      return NextResponse.json({ rewards: rewards || [] });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch loyalty data' }, { status: 500 });
  }
}

// POST /api/loyalty-rewards - Manage loyalty program
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'redeem';

    if (action === 'redeem') {
      const { reward_id } = body;

      // Get reward
      const { data: reward } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('id', reward_id)
        .eq('is_active', true)
        .single();

      if (!reward) {
        return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
      }

      // Get user's account
      const { data: account } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!account || account.points_balance < reward.points_required) {
        return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
      }

      // Check quantity
      if (reward.quantity_available !== null && reward.quantity_available <= 0) {
        return NextResponse.json({ error: 'Reward no longer available' }, { status: 400 });
      }

      // Generate redemption code
      const redemptionCode = generateRedemptionCode();

      // Calculate expiration
      const expiresAt = reward.expiration_days
        ? new Date(Date.now() + reward.expiration_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Create redemption
      const { data: redemption, error } = await supabase
        .from('loyalty_redemptions')
        .insert({
          user_id: user.id,
          reward_id,
          points_spent: reward.points_required,
          redemption_code: redemptionCode,
          status: 'active',
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Deduct points
      await supabase
        .from('loyalty_accounts')
        .update({
          points_balance: account.points_balance - reward.points_required,
        })
        .eq('user_id', user.id);

      // Log transaction
      await supabase.from('loyalty_transactions').insert({
        user_id: user.id,
        transaction_type: 'redemption',
        points: -reward.points_required,
        description: `Redeemed: ${reward.name}`,
        reference_id: redemption.id,
        reference_type: 'redemption',
      });

      // Update reward quantity
      if (reward.quantity_available !== null) {
        await supabase
          .from('loyalty_rewards')
          .update({ quantity_available: reward.quantity_available - 1 })
          .eq('id', reward_id);
      }

      return NextResponse.json({
        redemption,
        redemption_code: redemptionCode,
        new_balance: account.points_balance - reward.points_required,
      });
    } else if (action === 'earn_points') {
      const { points, description, reference_type, reference_id } = body;

      // Get or create account
      let { data: account } = await supabase
        .from('loyalty_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!account) {
        const { data: newAccount } = await supabase
          .from('loyalty_accounts')
          .insert({
            user_id: user.id,
            points_balance: 0,
            lifetime_points: 0,
          })
          .select()
          .single();
        account = newAccount;
      }

      // Add points
      const newBalance = (account?.points_balance || 0) + points;
      const newLifetime = (account?.lifetime_points || 0) + points;

      await supabase
        .from('loyalty_accounts')
        .update({
          points_balance: newBalance,
          lifetime_points: newLifetime,
        })
        .eq('user_id', user.id);

      // Log transaction
      await supabase.from('loyalty_transactions').insert({
        user_id: user.id,
        transaction_type: 'earn',
        points,
        description,
        reference_id,
        reference_type,
      });

      // Check for tier upgrade
      const { data: newTier } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .lte('min_points', newLifetime)
        .order('min_points', { ascending: false })
        .limit(1)
        .single();

      if (newTier && newTier.id !== account?.tier_id) {
        await supabase
          .from('loyalty_accounts')
          .update({ tier_id: newTier.id })
          .eq('user_id', user.id);

        // Notify user of tier upgrade
        await supabase.from('unified_notifications').insert({
          user_id: user.id,
          title: 'Tier Upgrade! 🎉',
          message: `Congratulations! You've reached ${newTier.name} status!`,
          type: 'success',
          priority: 'high',
          source_platform: 'gvteway',
          source_entity_type: 'loyalty_tier',
          source_entity_id: newTier.id,
        });
      }

      return NextResponse.json({
        points_earned: points,
        new_balance: newBalance,
        lifetime_points: newLifetime,
        tier: newTier,
      });
    } else if (action === 'create_reward') {
      const validated = RewardSchema.parse(body);

      const { data: reward, error } = await supabase
        .from('loyalty_rewards')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ reward }, { status: 201 });
    } else if (action === 'use_redemption') {
      const { redemption_code } = body;

      const { data: redemption } = await supabase
        .from('loyalty_redemptions')
        .select('*')
        .eq('redemption_code', redemption_code)
        .eq('status', 'active')
        .single();

      if (!redemption) {
        return NextResponse.json({ error: 'Invalid or used redemption code' }, { status: 400 });
      }

      if (redemption.expires_at && new Date(redemption.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Redemption code has expired' }, { status: 400 });
      }

      // Mark as used
      await supabase
        .from('loyalty_redemptions')
        .update({
          status: 'used',
          used_at: new Date().toISOString(),
        })
        .eq('id', redemption.id);

      return NextResponse.json({ success: true, redemption });
    } else if (action === 'bonus_points') {
      // Admin action to give bonus points
      const { user_id, points, reason } = body;

      const { data: account } = await supabase
        .from('loyalty_accounts')
        .select('points_balance, lifetime_points')
        .eq('user_id', user_id)
        .single();

      if (!account) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      await supabase
        .from('loyalty_accounts')
        .update({
          points_balance: account.points_balance + points,
          lifetime_points: account.lifetime_points + points,
        })
        .eq('user_id', user_id);

      await supabase.from('loyalty_transactions').insert({
        user_id,
        transaction_type: 'bonus',
        points,
        description: reason,
        reference_type: 'admin_bonus',
      });

      // Notify user
      await supabase.from('unified_notifications').insert({
        user_id,
        title: 'Bonus Points!',
        message: `You've received ${points} bonus points: ${reason}`,
        type: 'success',
        priority: 'normal',
        source_platform: 'gvteway',
      });

      return NextResponse.json({ success: true, points_awarded: points });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to generate redemption code
function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
