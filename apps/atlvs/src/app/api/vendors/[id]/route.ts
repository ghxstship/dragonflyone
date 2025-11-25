import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const VendorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(['equipment', 'av', 'staging', 'lighting', 'catering', 'transportation', 'other']).optional(),
  contact_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'pending', 'inactive']).optional(),
  rating: z.number().min(0).max(5).optional(),
  payment_terms: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // In production, fetch from Supabase
    // const { data, error } = await supabase
    //   .from('vendors')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    const mockVendor = {
      id,
      name: 'ProAV Systems',
      category: 'av',
      contact_name: 'Sarah Johnson',
      email: 'sarah@proav.com',
      phone: '+1-555-0101',
      status: 'active',
      rating: 4.8,
      total_orders: 24,
      total_spend: 145000,
      payment_terms: 'Net 30',
      address: '123 Business Park, Tampa, FL 33602',
      website: 'https://proav.com',
      created_at: '2024-01-15',
      updated_at: '2024-11-23',
    };

    return NextResponse.json(mockVendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = VendorUpdateSchema.parse(body);

    // In production, update in Supabase
    // const { data, error } = await supabase
    //   .from('vendors')
    //   .update(validatedData)
    //   .eq('id', id)
    //   .select()
    //   .single();

    const updatedVendor = {
      id,
      ...validatedData,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json(updatedVendor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // In production, delete from Supabase
    // const { error } = await supabase
    //   .from('vendors')
    //   .delete()
    //   .eq('id', id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}
