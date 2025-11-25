import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from auth header (simplified - in production use proper auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('artist_followers')
      .select('id')
      .eq('artist_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Already following' });
    }

    // Create follow relationship
    const { error } = await supabase
      .from('artist_followers')
      .insert({
        artist_id: params.id,
        user_id: user.id,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update follower count
    await supabase.rpc('increment_artist_followers', { artist_id: params.id });

    return NextResponse.json({ success: true, following: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove follow relationship
    const { error } = await supabase
      .from('artist_followers')
      .delete()
      .eq('artist_id', params.id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Decrement follower count
    await supabase.rpc('decrement_artist_followers', { artist_id: params.id });

    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
