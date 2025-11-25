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

    // Verify handbook exists and is active
    const { data: handbook, error: handbookError } = await supabase
      .from('handbook_versions')
      .select('id, status, requires_acknowledgment')
      .eq('id', params.id)
      .single();

    if (handbookError || !handbook) {
      return NextResponse.json(
        { error: 'Handbook not found' },
        { status: 404 }
      );
    }

    if (handbook.status !== 'active') {
      return NextResponse.json(
        { error: 'Handbook is not active' },
        { status: 400 }
      );
    }

    // Check if already acknowledged
    const { data: existing } = await supabase
      .from('employee_acknowledgments')
      .select('id')
      .eq('user_id', user.id)
      .eq('handbook_version_id', params.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already acknowledged' },
        { status: 409 }
      );
    }

    // Get IP and user agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    const { data, error } = await supabase
      .from('employee_acknowledgments')
      .insert({
        user_id: user.id,
        acknowledgment_type: 'handbook',
        handbook_version_id: params.id,
        ip_address: ip,
        user_agent: userAgent,
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
      .eq('handbook_version_id', params.id)
      .eq('status', 'pending');

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error acknowledging handbook:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge handbook' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get all acknowledgments for this handbook
    const { data, error } = await supabase
      .from('employee_acknowledgments')
      .select(`
        *,
        user:platform_users!user_id(id, email, full_name, department_id)
      `)
      .eq('handbook_version_id', params.id)
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
