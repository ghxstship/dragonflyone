import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const partnerSchema = z.object({
  partner_type_id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  legal_name: z.string().max(255).optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  website_url: z.string().url().optional(),
  contact_name: z.string().max(255).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(50).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  social_media: z.record(z.string()).optional(),
  business_hours: z.record(z.any()).optional(),
  categories: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  partnership_tier: z.enum(['platinum', 'gold', 'silver', 'bronze', 'standard']).default('standard'),
  commission_rate: z.number().optional(),
  contract_start_date: z.string().optional(),
  contract_end_date: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partner_type = searchParams.get('partner_type');
    const city = searchParams.get('city');
    const tier = searchParams.get('tier');
    const status = searchParams.get('status') || 'active';
    const event_id = searchParams.get('event_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('local_partners')
      .select(`
        *,
        partner_type:partner_types(id, name, code, icon),
        offers:partner_offers(id, title, offer_type, discount_value, valid_until, is_active)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    if (partner_type) {
      query = query.eq('partner_type_id', partner_type);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (tier) {
      query = query.eq('partnership_tier', tier);
    }

    const { data, error, count } = await query
      .order('partnership_tier')
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // If event_id provided, also get event associations
    if (event_id && data) {
      const partnerIds = data.map((p: { id: string }) => p.id);
      const { data: associations } = await supabase
        .from('partner_event_associations')
        .select('*')
        .eq('event_id', event_id)
        .in('partner_id', partnerIds);

      // Merge associations into partner data
      const partnersWithAssociations = data.map((partner: Record<string, unknown>) => ({
        ...partner,
        event_association: associations?.find((a: { partner_id: string }) => a.partner_id === partner.id),
      }));

      return NextResponse.json({
        data: partnersWithAssociations,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
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
    const validated = partnerSchema.parse(body);

    const { data, error } = await supabase
      .from('local_partners')
      .insert({
        ...validated,
        status: 'pending',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
