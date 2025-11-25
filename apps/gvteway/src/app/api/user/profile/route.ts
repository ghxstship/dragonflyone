import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    user: {
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@example.com',
      phone: '(305) 555-0123',
      city: 'Miami',
      state: 'FL',
      role: 'GVTEWAY_MEMBER',
      membershipTier: 'PLUS',
      platformRoles: ['GVTEWAY_MEMBER', 'GVTEWAY_MEMBER_PLUS'],
    },
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      user: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
