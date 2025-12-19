export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createRfpSchema = z.object({
  organization_id: z.string().uuid(),
  booking_id: z.string().uuid().optional(),
  production_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  requirements: z.array(z.record(z.unknown())).optional(),
  specifications: z.record(z.unknown()).optional(),
  submission_deadline: z.string(),
  questions_deadline: z.string().optional(),
  decision_date: z.string().optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  currency: z.string().default('USD'),
  evaluation_criteria: z.array(z.record(z.unknown())).optional(),
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
  vendor_ids: z.array(z.string().uuid()).optional(),
  created_by: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const orgId = searchParams.get('organization_id');
    const status = searchParams.get('status');
    const bookingId = searchParams.get('booking_id');

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    let query = supabase
      .from('rfps')
      .select(`
        *,
        booking:bookings(id, booking_number, event_name),
        production:productions(id, name),
        vendors:rfp_vendors(
          id, status, invited_at, viewed_at, submitted_at,
          vendor:vendor_profiles(id, name, logo_url)
        ),
        quotes:rfp_quotes(id, vendor_id, total, submitted_at, ranking)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (bookingId) query = query.eq('booking_id', bookingId);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rfps: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createRfpSchema.parse(body);

    const { vendor_ids, ...rfpData } = payload;

    const { data: countData } = await supabase
      .from('rfps')
      .select('id', { count: 'exact' })
      .eq('organization_id', payload.organization_id);

    const year = new Date().getFullYear().toString().slice(-2);
    const num = ((countData?.length || 0) + 1).toString().padStart(4, '0');
    const rfpNumber = `RFP${year}${num}`;

    const { data: rfp, error: rfpError } = await supabase
      .from('rfps')
      .insert({
        ...rfpData,
        rfp_number: rfpNumber,
        status: 'draft',
      })
      .select()
      .single();

    if (rfpError) {
      return NextResponse.json({ error: rfpError.message }, { status: 500 });
    }

    if (vendor_ids && vendor_ids.length > 0) {
      const vendorInvites = vendor_ids.map((vendorId) => ({
        rfp_id: rfp.id,
        vendor_id: vendorId,
        status: 'invited',
      }));

      const { error: inviteError } = await supabase
        .from('rfp_vendors')
        .insert(vendorInvites);

      if (inviteError) {
        console.error('Failed to invite vendors:', inviteError);
      }
    }

    const { data: fullRfp } = await supabase
      .from('rfps')
      .select(`
        *,
        vendors:rfp_vendors(
          id, status,
          vendor:vendor_profiles(id, name, logo_url)
        )
      `)
      .eq('id', rfp.id)
      .single();

    return NextResponse.json({ rfp: fullRfp }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
