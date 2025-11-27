import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const certificationSchema = z.object({
  asset_id: z.string().uuid().optional(),
  component_id: z.string().uuid().optional(),
  certification_type_id: z.string().uuid().optional(),
  certification_name: z.string().min(1).max(255),
  certificate_number: z.string().max(100).optional(),
  issuing_authority: z.string().max(255).optional(),
  issue_date: z.string(),
  expiration_date: z.string().optional(),
  scope: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  certificate_url: z.string().url().optional(),
  verification_url: z.string().url().optional(),
  renewal_cost: z.number().optional(),
  notification_days_before: z.number().int().default(60),
  notes: z.string().optional(),
}).refine(data => data.asset_id || data.component_id, {
  message: 'Either asset_id or component_id must be provided',
});

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const asset_id = searchParams.get('asset_id');
    const component_id = searchParams.get('component_id');
    const status = searchParams.get('status');
    const expiring_days = searchParams.get('expiring_days');
    const expired_only = searchParams.get('expired_only') === 'true';

    let query = supabase
      .from('equipment_certifications')
      .select(`
        *,
        asset:assets(id, name, asset_tag, category),
        component:serialized_components(id, serial_number, component_type),
        certification_type:certification_types(id, name, code, category, issuing_authority)
      `);

    if (asset_id) {
      query = query.eq('asset_id', asset_id);
    }
    if (component_id) {
      query = query.eq('component_id', component_id);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (expired_only) {
      query = query.eq('status', 'expired');
    }
    if (expiring_days) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(expiring_days));
      query = query
        .lte('expiration_date', futureDate.toISOString().split('T')[0])
        .gte('expiration_date', new Date().toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('expiration_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching equipment certifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment certifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = certificationSchema.parse(body);

    // Determine initial status
    let status = 'active';
    if (validated.expiration_date) {
      const expDate = new Date(validated.expiration_date);
      if (expDate < new Date()) {
        status = 'expired';
      }
    }

    const { data, error } = await supabase
      .from('equipment_certifications')
      .insert({
        ...validated,
        status,
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
    console.error('Error creating equipment certification:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment certification' },
      { status: 500 }
    );
  }
}
