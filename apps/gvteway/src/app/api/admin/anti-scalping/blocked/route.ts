import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const createBlockSchema = z.object({
  type: z.enum(['ip', 'email', 'device', 'payment_method']),
  value: z.string().min(1),
  reason: z.string().min(1),
});

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: blocked, error } = await supabase
      .from('blocked_entities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blocked entities:', error);
      return NextResponse.json({ error: 'Failed to fetch blocked list' }, { status: 500 });
    }

    // Transform to match the expected format
    const transformedBlocked = (blocked || []).map(block => ({
      id: block.id,
      type: block.entity_type,
      value: block.entity_id || '',
      reason: block.reason || '',
      blocked_at: block.created_at,
    }));

    return NextResponse.json({ blocked: transformedBlocked });
  } catch (error) {
    console.error('Error in blocked entities API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createBlockSchema.parse(body);

    const { data: blocked, error } = await supabase
      .from('blocked_entities')
      .insert({
        user_id: user.id,
        entity_type: validated.type,
        entity_id: validated.value,
        reason: validated.reason,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blocked entity:', error);
      return NextResponse.json({ error: 'Failed to block entity' }, { status: 500 });
    }

    return NextResponse.json({ 
      blocked: {
        id: blocked.id,
        type: blocked.entity_type,
        value: blocked.entity_id,
        reason: blocked.reason,
        blocked_at: blocked.created_at,
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    console.error('Error in blocked entities POST API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
