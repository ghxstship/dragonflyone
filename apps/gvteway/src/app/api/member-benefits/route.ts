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

const benefitSchema = z.object({
  membership_tier_id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['discount', 'priority_access', 'exclusive_content', 'free_item', 'upgrade', 'early_access']),
  value: z.number().optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
  valid_from: z.string().datetime().optional(),
  valid_to: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const tierId = searchParams.get('tier_id');
    const memberId = searchParams.get('member_id');

    if (memberId) {
      // Get member's tier and associated benefits
      const { data: member } = await supabase
        .from('memberships')
        .select('tier_id, membership_tiers(id, name, benefits:member_benefits(*))')
        .eq('user_id', memberId)
        .eq('status', 'active')
        .single();

      return NextResponse.json({ member_benefits: member });
    }

    let query = supabase.from('member_benefits').select('*, membership_tier:membership_tiers(id, name)');
    if (tierId) query = query.eq('membership_tier_id', tierId);

    const { data: benefits, error } = await query;
    if (error) throw error;

    return NextResponse.json({ benefits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = benefitSchema.parse(body);

    const { data: benefit, error } = await supabase
      .from('member_benefits')
      .insert({ ...validated, status: 'active', created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ benefit }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: benefit, error } = await supabase
      .from('member_benefits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ benefit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase.from('member_benefits').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
