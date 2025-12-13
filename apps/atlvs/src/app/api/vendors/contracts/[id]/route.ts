export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';
import { logger } from '@ghxstship/config';

const UpdateVendorContractSchema = z.object({
  contract_type: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  value: z.number().positive().optional(),
  start_date: z.string().optional(),
  expiry_date: z.string().optional(),
  auto_renew: z.boolean().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'active', 'expiring', 'expired', 'terminated', 'renewed']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('vendor_contracts')
      .select(`
        *,
        vendors(id, name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      logger.error('Error fetching vendor contract:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const expiryDate = new Date(data.end_date || now);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      contract: {
        ...data,
        vendor_name: data.vendors?.name || 'Unknown Vendor',
        days_until_expiry: daysUntilExpiry,
      },
    });
  } catch (error: unknown) {
    logger.error('Error in GET /api/vendors/contracts/[id]:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const { id } = await params;
    const body = await request.json();

    const validationResult = UpdateVendorContractSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vendor_contracts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      logger.error('Error updating vendor contract:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contract: data });
  } catch (error: unknown) {
    logger.error('Error in PATCH /api/vendors/contracts/[id]:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createAdminClient();
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('vendor_contracts')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting vendor contract:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    logger.error('Error in DELETE /api/vendors/contracts/[id]:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
