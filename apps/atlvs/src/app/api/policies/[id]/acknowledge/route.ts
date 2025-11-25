import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const acknowledgeSchema = z.object({
  signature_data: z.string().optional(),
  acknowledgment_method: z.enum(['electronic', 'physical', 'verbal']).default('electronic'),
  notes: z.string().optional(),
});

export async function POST(
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

    const body = await request.json();
    const validated = acknowledgeSchema.parse(body);

    // Verify policy exists and is active
    const { data: policy, error: policyError } = await supabase
      .from('company_policies')
      .select('id, status, requires_acknowledgment, acknowledgment_frequency')
      .eq('id', params.id)
      .single();

    if (policyError || !policy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    if (policy.status !== 'active') {
      return NextResponse.json(
        { error: 'Policy is not active' },
        { status: 400 }
      );
    }

    // Check if already acknowledged (for 'once' frequency)
    if (policy.acknowledgment_frequency === 'once') {
      const { data: existing } = await supabase
        .from('employee_acknowledgments')
        .select('id')
        .eq('user_id', user.id)
        .eq('policy_id', params.id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Already acknowledged' },
          { status: 409 }
        );
      }
    }

    // Get IP and user agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Calculate expiration based on frequency
    let expiresAt: string | null = null;
    if (policy.acknowledgment_frequency !== 'once') {
      const now = new Date();
      switch (policy.acknowledgment_frequency) {
        case 'annually':
          now.setFullYear(now.getFullYear() + 1);
          break;
        case 'semi_annually':
          now.setMonth(now.getMonth() + 6);
          break;
        case 'quarterly':
          now.setMonth(now.getMonth() + 3);
          break;
      }
      expiresAt = now.toISOString();
    }

    const { data, error } = await supabase
      .from('employee_acknowledgments')
      .insert({
        user_id: user.id,
        acknowledgment_type: 'policy',
        policy_id: params.id,
        ip_address: ip,
        user_agent: userAgent,
        expires_at: expiresAt,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;

    // Cancel any pending reminders
    await supabase
      .from('acknowledgment_reminders')
      .update({ status: 'acknowledged' })
      .eq('user_id', user.id)
      .eq('policy_id', params.id)
      .eq('status', 'pending');

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error acknowledging policy:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge policy' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('employee_acknowledgments')
      .select(`
        *,
        user:platform_users!user_id(id, email, full_name, department_id)
      `)
      .eq('policy_id', params.id)
      .order('acknowledged_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching acknowledgments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch acknowledgments' },
      { status: 500 }
    );
  }
}
