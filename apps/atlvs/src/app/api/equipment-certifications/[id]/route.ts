import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateSchema = z.object({
  certification_type_id: z.string().uuid().optional().nullable(),
  certification_name: z.string().min(1).max(255).optional(),
  certificate_number: z.string().max(100).optional().nullable(),
  issuing_authority: z.string().max(255).optional().nullable(),
  issue_date: z.string().optional(),
  expiration_date: z.string().optional().nullable(),
  status: z.enum(['active', 'expired', 'suspended', 'revoked', 'pending_renewal']).optional(),
  scope: z.string().optional().nullable(),
  conditions: z.array(z.string()).optional(),
  certificate_url: z.string().url().optional().nullable(),
  verification_url: z.string().url().optional().nullable(),
  renewal_cost: z.number().optional().nullable(),
  notification_days_before: z.number().int().optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('equipment_certifications')
      .select(`
        *,
        asset:assets(id, name, asset_tag, category, status),
        component:serialized_components(id, serial_number, component_type, manufacturer, model),
        certification_type:certification_types(id, name, code, category, issuing_authority, validity_period_months, renewal_requirements),
        renewals:certification_renewals(
          id, renewal_date, previous_expiration, new_expiration, renewal_type, cost
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Certification not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching equipment certification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment certification' },
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
      .from('equipment_certifications')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Certification not found' },
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
    console.error('Error updating equipment certification:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment certification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('equipment_certifications')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting equipment certification:', error);
    return NextResponse.json(
      { error: 'Failed to delete equipment certification' },
      { status: 500 }
    );
  }
}
