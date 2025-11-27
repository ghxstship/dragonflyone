import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const VendorSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['equipment', 'av', 'staging', 'lighting', 'catering', 'transportation', 'security', 'staffing', 'other']),
  contact_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(['active', 'pending', 'inactive', 'blacklisted']).default('pending'),
  payment_terms: z.string().optional(),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('US'),
  website: z.string().url().optional(),
  notes: z.string().optional(),
  insurance_expiry: z.string().optional(),
  w9_on_file: z.boolean().default(false),
  preferred: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// GET /api/vendors - List all vendors
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const preferred = searchParams.get('preferred') === 'true';

    let query = supabase
      .from('vendors')
      .select(`
        *,
        purchase_orders:purchase_orders(count),
        total_spend:purchase_orders(total_amount)
      `)
      .order('name', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (preferred) {
      query = query.eq('preferred', true);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,contact_name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vendors', details: error.message },
        { status: 500 }
      );
    }

    interface VendorRecord {
      id: string;
      status: string;
      category: string;
      preferred: boolean;
      [key: string]: unknown;
    }
    const vendors = (data || []) as unknown as VendorRecord[];

    const summary = {
      total: vendors.length,
      by_status: {
        active: vendors.filter(v => v.status === 'active').length,
        pending: vendors.filter(v => v.status === 'pending').length,
        inactive: vendors.filter(v => v.status === 'inactive').length,
        blacklisted: vendors.filter(v => v.status === 'blacklisted').length,
      },
      by_category: vendors.reduce((acc, v) => {
        acc[v.category] = (acc[v.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      preferred_count: vendors.filter(v => v.preferred).length,
    };

    return NextResponse.json({ vendors: data, summary });
  } catch (error) {
    console.error('Error in GET /api/vendors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = VendorSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate vendor code
    const { data: vendorCode } = await supabase.rpc('generate_vendor_code', {
      org_id: organizationId,
    });

    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        vendor_code: vendorCode,
        organization_id: organizationId,
        ...validated,
        created_by: userId,
        rating: 0,
        total_orders: 0,
        total_spend: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor:', error);
      return NextResponse.json(
        { error: 'Failed to create vendor', details: error.message },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('vendor_activity_log').insert({
      vendor_id: vendor.id,
      activity_type: 'created',
      user_id: userId,
      description: 'Vendor created',
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/vendors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
