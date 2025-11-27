import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

// Validation schema
const certificationSchema = z.object({
  crew_member_id: z.string().uuid(),
  certification_type_id: z.string().uuid(),
  certificate_number: z.string().optional(),
  status: z.enum(['active', 'expired', 'suspended', 'pending_verification', 'revoked']).default('active'),
  issued_date: z.string(), // ISO date
  expiration_date: z.string().optional(),
  issued_by: z.string().optional(),
  issuing_organization: z.string().optional(),
  certificate_url: z.string().url().optional(),
  verified: z.boolean().default(false),
  reminder_days_before: z.number().default(30),
  notes: z.string().optional(),
});

// GET /api/certifications - List certifications
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');
    const certificationTypeId = searchParams.get('certification_type_id');
    const status = searchParams.get('status');
    const expiringSoon = searchParams.get('expiring_soon') === 'true';
    const expired = searchParams.get('expired') === 'true';

    let query = supabase
      .from('crew_certifications')
      .select(`
        *,
        crew_member:crew_members!crew_member_id(id, full_name, email),
        certification_type:certification_types!certification_type_id(id, name, code, category, issuing_organization),
        verified_by_user:platform_users!verified_by(id, full_name)
      `)
      .order('expiration_date', { ascending: true, nullsFirst: false });

    // Apply filters
    if (crewMemberId) {
      query = query.eq('crew_member_id', crewMemberId);
    }

    if (certificationTypeId) {
      query = query.eq('certification_type_id', certificationTypeId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Get certifications expiring in next 90 days
    if (expiringSoon) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      query = query
        .eq('status', 'active')
        .gte('expiration_date', new Date().toISOString().split('T')[0])
        .lte('expiration_date', futureDate.toISOString().split('T')[0]);
    }

    if (expired) {
      query = query
        .eq('status', 'expired')
        .lt('expiration_date', new Date().toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching certifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch certifications', details: error.message },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const now = new Date();
    const summary = {
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      expired: data.filter(c => c.status === 'expired').length,
      expiring_soon: data.filter(c => {
        if (!c.expiration_date || c.status !== 'active') return false;
        const expDate = new Date(c.expiration_date);
        const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 90;
      }).length,
      pending_verification: data.filter(c => c.status === 'pending_verification').length,
      verified: data.filter(c => c.verified).length,
    };

    return NextResponse.json({
      certifications: data,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/certifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/certifications - Create new certification
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();

    // Validate input
    const validated = certificationSchema.parse(body);

    // TODO: Get user from auth session
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('crew_certifications')
      .insert([
        {
          ...validated,
          created_by: userId,
        },
      ])
      .select(`
        *,
        crew_member:crew_members!crew_member_id(id, full_name),
        certification_type:certification_types!certification_type_id(id, name, code, category)
      `)
      .single();

    if (error) {
      console.error('Error creating certification:', error);
      return NextResponse.json(
        { error: 'Failed to create certification', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/certifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/certifications - Bulk verify/update certifications
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { certification_ids, action, updates } = body;

    if (!certification_ids || !Array.isArray(certification_ids) || certification_ids.length === 0) {
      return NextResponse.json(
        { error: 'certification_ids array is required' },
        { status: 400 }
      );
    }

    // TODO: Get user from auth session
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Handle specific actions
    if (action === 'verify') {
      updateData = {
        ...updateData,
        verified: true,
        verified_by: userId,
        verified_date: new Date().toISOString().split('T')[0],
        verification_method: 'manual',
        status: 'active',
      };
    } else if (action === 'expire') {
      updateData = {
        ...updateData,
        status: 'expired',
      };
    } else if (updates) {
      updateData = {
        ...updateData,
        ...updates,
      };
    }

    const { data, error } = await supabase
      .from('crew_certifications')
      .update(updateData)
      .in('id', certification_ids)
      .select();

    if (error) {
      console.error('Error updating certifications:', error);
      return NextResponse.json(
        { error: 'Failed to update certifications', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action: action || 'update',
      updated: data.length,
      certifications: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/certifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
