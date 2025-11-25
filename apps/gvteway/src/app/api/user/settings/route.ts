import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      settings: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
  });
}
