import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const mockUserRewards = {
      user_id: userId,
      points: 3450,
      tier: 'Gold',
      lifetime_points: 8920,
      rewards: [
        {
          id: '1',
          name: '$10 Off Next Purchase',
          points: 500,
          type: 'Discount',
          available: true,
        },
        {
          id: '2',
          name: 'Early Access to Tickets',
          points: 1000,
          type: 'Access',
          available: true,
        },
        {
          id: '3',
          name: 'VIP Lounge Access',
          points: 2000,
          type: 'Experience',
          available: false,
        },
      ],
      activities: [
        { action: 'Purchase Ticket', points: 100, date: '2024-11-20' },
        { action: 'Refer a Friend', points: 500, date: '2024-11-15' },
        { action: 'Write Review', points: 50, date: '2024-11-18' },
      ],
    };

    return NextResponse.json(mockUserRewards);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rewards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, reward_id, action } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    if (action === 'redeem' && !reward_id) {
      return NextResponse.json({ error: 'reward_id required for redemption' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: action === 'redeem' ? 'Reward redeemed successfully' : 'Points earned',
      user_id 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process reward action' }, { status: 500 });
  }
}
