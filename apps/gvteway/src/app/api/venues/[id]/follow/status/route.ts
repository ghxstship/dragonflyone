import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ following: false });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ following: false });
    }

    const { data } = await supabase
      .from('venue_followers')
      .select('id')
      .eq('venue_id', params.id)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ following: !!data });
  } catch (error) {
    return NextResponse.json({ following: false });
  }
}
