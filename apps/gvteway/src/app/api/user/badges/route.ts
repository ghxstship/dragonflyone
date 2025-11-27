import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// Default badge definitions
const BADGE_DEFINITIONS = [
  { id: 'first_event', name: 'First Timer', description: 'Attended your first event', icon: '🎫', tier: 'bronze', requirement: 'Attend 1 event', total: 1 },
  { id: 'event_5', name: 'Regular', description: 'Attended 5 events', icon: '🎪', tier: 'silver', requirement: 'Attend 5 events', total: 5 },
  { id: 'event_25', name: 'Superfan', description: 'Attended 25 events', icon: '⭐', tier: 'gold', requirement: 'Attend 25 events', total: 25 },
  { id: 'event_100', name: 'Legend', description: 'Attended 100 events', icon: '👑', tier: 'platinum', requirement: 'Attend 100 events', total: 100 },
  { id: 'first_review', name: 'Critic', description: 'Wrote your first review', icon: '✍️', tier: 'bronze', requirement: 'Write 1 review', total: 1 },
  { id: 'review_10', name: 'Reviewer', description: 'Wrote 10 reviews', icon: '📝', tier: 'silver', requirement: 'Write 10 reviews', total: 10 },
  { id: 'early_bird', name: 'Early Bird', description: 'Bought tickets within first hour', icon: '🐦', tier: 'bronze', requirement: 'Buy tickets early', total: 1 },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Connected with 10 fans', icon: '🦋', tier: 'silver', requirement: 'Follow 10 fans', total: 10 },
  { id: 'verified', name: 'Verified Fan', description: 'Verified your identity', icon: '✓', tier: 'gold', requirement: 'Complete verification', total: 1 },
];

// Default fan tiers
const FAN_TIERS = [
  { id: 'new', name: 'New Fan', level: 1, icon: '🌱', points_required: 0, perks: ['Access to public events', 'Basic profile'] },
  { id: 'bronze', name: 'Bronze Fan', level: 2, icon: '🥉', points_required: 100, perks: ['Early access alerts', 'Community forums', 'Basic badges'] },
  { id: 'silver', name: 'Silver Fan', level: 3, icon: '🥈', points_required: 500, perks: ['Priority customer support', 'Exclusive discounts', 'Silver badges'] },
  { id: 'gold', name: 'Gold Fan', level: 4, icon: '🥇', points_required: 2000, perks: ['VIP presale access', 'Meet & greet opportunities', 'Gold badges'] },
  { id: 'platinum', name: 'Platinum Fan', level: 5, icon: '💎', points_required: 10000, perks: ['Backstage access', 'Artist interactions', 'All badges', 'Exclusive merch'] },
];

export async function GET(request: NextRequest) {
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

    // Get user's earned badges
    const { data: userBadges } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);

    // Get user's points
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', user.id)
      .single();

    const currentPoints = userPoints?.total_points || 0;

    // Get user's activity counts for progress
    const { count: eventCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'used');

    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: followCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', user.id);

    // Map earned badges
    const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);
    const earnedBadges = userBadges?.map(ub => {
      const def = BADGE_DEFINITIONS.find(d => d.id === ub.badge_id);
      return {
        id: ub.id,
        badge_id: ub.badge_id,
        name: def?.name || 'Unknown',
        description: def?.description || '',
        icon: def?.icon || '🏆',
        tier: def?.tier || 'bronze',
        earned_at: ub.earned_at,
        is_featured: ub.is_featured,
      };
    }) || [];

    // Map available badges with progress
    const availableBadges = BADGE_DEFINITIONS.map(def => {
      let progress = 0;
      if (def.id.startsWith('event')) {
        progress = eventCount || 0;
      } else if (def.id.startsWith('review')) {
        progress = reviewCount || 0;
      } else if (def.id === 'social_butterfly') {
        progress = followCount || 0;
      }

      return {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        tier: def.tier,
        requirement: def.requirement,
        progress: Math.min(progress, def.total),
        total: def.total,
        is_earned: earnedBadgeIds.has(def.id),
      };
    });

    // Map fan tiers
    const fanTiers = FAN_TIERS.map(tier => ({
      ...tier,
      is_current: currentPoints >= tier.points_required &&
        (FAN_TIERS.find(t => t.points_required > tier.points_required)?.points_required || Infinity) > currentPoints,
    }));

    return NextResponse.json({
      earned_badges: earnedBadges,
      available_badges: availableBadges,
      fan_tiers: fanTiers,
      current_points: currentPoints,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
