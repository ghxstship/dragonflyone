import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(20).transform(val => val.toUpperCase()),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed', 'free_ticket', 'bogo']),
  discount_value: z.number().positive(),
  event_id: z.string().uuid().optional(),
  ticket_type_ids: z.array(z.string().uuid()).optional(),
  min_purchase: z.number().optional(),
  max_discount: z.number().optional(),
  usage_limit: z.number().int().positive().optional(),
  per_user_limit: z.number().int().positive().default(1),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  requires_email_domain: z.string().optional(),
  requires_verification: z.boolean().default(false),
  verification_type: z.enum(['student', 'military', 'senior', 'employee', 'member']).optional(),
});

const validatePromoCodeSchema = z.object({
  code: z.string().min(1),
  event_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  subtotal: z.number().optional(),
});

// GET /api/promo-codes - List promo codes (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const isActive = searchParams.get('is_active');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('promo_codes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.or(`event_id.eq.${eventId},event_id.is.null`);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate stats for each promo code
    const promoCodesWithStats = data?.map(promo => ({
      ...promo,
      usage_remaining: promo.usage_limit ? promo.usage_limit - promo.usage_count : null,
      is_expired: promo.end_date && new Date(promo.end_date) < new Date(),
      is_not_started: promo.start_date && new Date(promo.start_date) > new Date(),
    }));

    return NextResponse.json({
      promo_codes: promoCodesWithStats,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/promo-codes - Create promo code or validate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Validate promo code
    if (action === 'validate') {
      const validated = validatePromoCodeSchema.parse(body);

      // Use the database function to validate
      const { data: result, error } = await supabase.rpc('validate_promo_code', {
        p_code: validated.code.toUpperCase(),
        p_event_id: validated.event_id,
        p_user_id: validated.user_id || null,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const validationResult = result?.[0];

      if (!validationResult?.is_valid) {
        return NextResponse.json({
          valid: false,
          error: validationResult?.error_message || 'Invalid promo code',
        }, { status: 400 });
      }

      // Calculate discount
      let discountAmount = 0;
      if (validated.subtotal) {
        if (validationResult.discount_type === 'percentage') {
          discountAmount = (validated.subtotal * validationResult.discount_value) / 100;
        } else if (validationResult.discount_type === 'fixed') {
          discountAmount = validationResult.discount_value;
        }
      }

      return NextResponse.json({
        valid: true,
        promo_code_id: validationResult.promo_code_id,
        discount_type: validationResult.discount_type,
        discount_value: validationResult.discount_value,
        discount_amount: discountAmount,
      });
    }

    // Create new promo code
    const validated = createPromoCodeSchema.parse(body);

    // Check if code already exists
    const { data: existing } = await supabase
      .from('promo_codes')
      .select('id')
      .eq('code', validated.code)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 409 }
      );
    }

    const { data: promoCode, error: insertError } = await supabase
      .from('promo_codes')
      .insert({
        ...validated,
        is_active: true,
        usage_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create promo code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      promo_code: promoCode,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/promo-codes - Update promo code
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Transform code to uppercase if provided
    if (updates.code) {
      updates.code = updates.code.toUpperCase();
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      promo_code: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/promo-codes - Delete or deactivate promo code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hardDelete = searchParams.get('hard') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    if (hardDelete) {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Soft delete - just deactivate
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Promo code deleted' : 'Promo code deactivated',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
