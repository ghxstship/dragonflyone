import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all available interests
    const { data: interests, error } = await supabase
      .from('interests')
      .select('*')
      .order('category')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user's selected interests if authenticated
    let userInterests: string[] = [];
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        const { data: selected } = await supabase
          .from('user_interests')
          .select('interest_id')
          .eq('user_id', user.id);

        userInterests = selected?.map(s => s.interest_id) || [];
      }
    }

    return NextResponse.json({
      interests: interests?.map(i => ({
        id: i.id,
        name: i.name,
        category: i.category,
        icon: i.icon || '🎵',
      })) || [],
      user_interests: userInterests,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { interests } = body;

    if (!Array.isArray(interests)) {
      return NextResponse.json({ error: 'Interests must be an array' }, { status: 400 });
    }

    // Delete existing interests
    await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', user.id);

    // Insert new interests
    if (interests.length > 0) {
      const { error } = await supabase
        .from('user_interests')
        .insert(interests.map(interestId => ({
          user_id: user.id,
          interest_id: interestId,
        })));

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
