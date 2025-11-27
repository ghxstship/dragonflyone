import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/contracts/[id] - Get contract by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        vendor:vendors(id, name, email, phone),
        client:contacts(id, full_name, email, phone),
        owner:platform_users!owner_id(id, full_name, email),
        milestones:contract_milestones(*),
        amendments:contract_amendments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching contract:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/contracts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/contracts/[id] - Update contract
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id: _, created_at, created_by, organization_id, ...updates } = body;

    const { data, error } = await supabase
      .from('contracts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        vendor:vendors(id, name),
        client:contacts(id, full_name),
        owner:platform_users!owner_id(id, full_name)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }

      console.error('Error updating contract:', error);
      return NextResponse.json(
        { error: 'Failed to update contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/contracts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts/[id] - Delete contract
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient();
  try {
    const { id } = params;

    // Only allow deletion of draft contracts
    const { data: contract } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', id)
      .single();

    if (contract && contract.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft contracts can be deleted' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contract:', error);
      return NextResponse.json(
        { error: 'Failed to delete contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/contracts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
