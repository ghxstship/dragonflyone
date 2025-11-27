import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const paymentTermSchema = z.object({
  vendor_id: z.string().uuid(),
  term_name: z.string().min(1),
  days_due: z.number().min(0),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_days: z.number().min(0).optional(),
  is_default: z.boolean().default(false),
});

// GET - Get vendor payment terms
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'all' | 'vendor' | 'summary'
    const vendorId = searchParams.get('vendor_id');

    if (type === 'vendor' && vendorId) {
      const { data: terms, error } = await supabase
        .from('vendor_payment_terms')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('is_default', { ascending: false });

      if (error) throw error;

      const defaultTerm = terms?.find(t => t.is_default);

      return NextResponse.json({
        terms,
        default_term: defaultTerm,
      });
    }

    if (type === 'summary') {
      // Get payment terms summary across all vendors
      const { data: terms, error } = await supabase
        .from('vendor_payment_terms')
        .select(`
          *,
          vendor:vendors(id, name)
        `)
        .eq('is_default', true);

      if (error) throw error;

      // Group by term type
      const byTermName = terms?.reduce((acc: Record<string, number>, t) => {
        acc[t.term_name] = (acc[t.term_name] || 0) + 1;
        return acc;
      }, {});

      // Calculate average days
      const avgDays = terms?.length 
        ? Math.round(terms.reduce((sum, t) => sum + t.days_due, 0) / terms.length)
        : 0;

      return NextResponse.json({
        terms,
        by_term_name: byTermName,
        average_days_due: avgDays,
        vendors_with_terms: terms?.length || 0,
      });
    }

    // Default: return all terms
    const { data: terms, error } = await supabase
      .from('vendor_payment_terms')
      .select(`
        *,
        vendor:vendors(id, name)
      `)
      .order('vendor_id', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ terms });
  } catch (error: any) {
    console.error('Vendor payment terms error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create payment term
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = paymentTermSchema.parse(body);

    // If setting as default, unset other defaults for this vendor
    if (validated.is_default) {
      await supabase
        .from('vendor_payment_terms')
        .update({ is_default: false })
        .eq('vendor_id', validated.vendor_id)
        .eq('is_default', true);
    }

    const { data: term, error } = await supabase
      .from('vendor_payment_terms')
      .insert({
        ...validated,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ term }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Vendor payment terms error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update payment term
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // If setting as default, unset other defaults
    if (updates.is_default) {
      const { data: current } = await supabase
        .from('vendor_payment_terms')
        .select('vendor_id')
        .eq('id', id)
        .single();

      if (current) {
        await supabase
          .from('vendor_payment_terms')
          .update({ is_default: false })
          .eq('vendor_id', current.vendor_id)
          .eq('is_default', true);
      }
    }

    const { data: term, error } = await supabase
      .from('vendor_payment_terms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ term });
  } catch (error: any) {
    console.error('Vendor payment terms error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete payment term
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('vendor_payment_terms')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Vendor payment terms error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
