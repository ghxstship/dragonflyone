import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const renewalSchema = z.object({
  renewal_date: z.string(),
  new_expiration: z.string(),
  renewal_type: z.enum(['standard', 'expedited', 'provisional', 'extension']).default('standard'),
  cost: z.number().optional(),
  documentation: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string().optional(),
  })).optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = renewalSchema.parse(body);

    // Get current certification
    const { data: certification, error: certError } = await supabase
      .from('equipment_certifications')
      .select('expiration_date')
      .eq('id', params.id)
      .single();

    if (certError || !certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Create renewal record
    const { data: renewal, error: renewalError } = await supabase
      .from('certification_renewals')
      .insert({
        certification_id: params.id,
        renewal_date: validated.renewal_date,
        previous_expiration: certification.expiration_date,
        new_expiration: validated.new_expiration,
        renewal_type: validated.renewal_type,
        cost: validated.cost,
        documentation: validated.documentation || [],
        notes: validated.notes,
      })
      .select()
      .single();

    if (renewalError) throw renewalError;

    // Update certification with new expiration and status
    const { error: updateError } = await supabase
      .from('equipment_certifications')
      .update({
        expiration_date: validated.new_expiration,
        status: 'active',
      })
      .eq('id', params.id);

    if (updateError) throw updateError;

    return NextResponse.json({ data: renewal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error renewing certification:', error);
    return NextResponse.json(
      { error: 'Failed to renew certification' },
      { status: 500 }
    );
  }
}
