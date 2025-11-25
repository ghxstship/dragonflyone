import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateSchema = z.object({
  partner_type_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  legal_name: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  contact_name: z.string().max(255).optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(50).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  social_media: z.record(z.string()).optional(),
  business_hours: z.record(z.any()).optional(),
  categories: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  partnership_tier: z.enum(['platinum', 'gold', 'silver', 'bronze', 'standard']).optional(),
  commission_rate: z.number().optional().nullable(),
  status: z.enum(['pending', 'active', 'suspended', 'terminated']).optional(),
  contract_start_date: z.string().optional().nullable(),
  contract_end_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('local_partners')
      .select(`
        *,
        partner_type:partner_types(id, name, code, icon),
        contacts:partner_contacts(id, name, title, email, phone, is_primary, department),
        offers:partner_offers(
          id, title, description, offer_type, discount_type, discount_value,
          promo_code, valid_from, valid_until, is_active
        ),
        event_associations:partner_event_associations(
          id, event_id, association_type, partnership_level, status,
          event:events(id, name, start_date, end_date)
        ),
        metrics:partner_metrics(metric_date, impressions, clicks, referrals, conversions, revenue_generated)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Partner not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const { data, error } = await supabase
      .from('local_partners')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Partner not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by setting status to terminated
    const { error } = await supabase
      .from('local_partners')
      .update({ status: 'terminated' })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
