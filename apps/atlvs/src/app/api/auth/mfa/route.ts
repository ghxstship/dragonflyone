import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

/**
 * GET /api/auth/mfa - Get MFA status for the current user
 */
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
  
  if (factorsError) {
    return NextResponse.json({ error: factorsError.message }, { status: 500 });
  }
  
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  
  const verifiedFactors = factorsData.totp.filter((f) => f.status === 'verified');
  
  return NextResponse.json({
    enabled: verifiedFactors.length > 0,
    factors: factorsData.totp,
    currentLevel: aalData?.currentLevel || 'aal1',
    nextLevel: aalData?.nextLevel || 'aal1',
  });
}

/**
 * POST /api/auth/mfa - Enroll in MFA
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const { action, factorId, code, friendlyName } = body;
  
  switch (action) {
    case 'enroll': {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: friendlyName || 'Authenticator App',
      });
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      return NextResponse.json({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
    }
    
    case 'verify': {
      if (!factorId || !code) {
        return NextResponse.json({ error: 'Missing factorId or code' }, { status: 400 });
      }
      
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      
      if (challengeError) {
        return NextResponse.json({ error: challengeError.message }, { status: 400 });
      }
      
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });
      
      if (verifyError) {
        return NextResponse.json({ error: verifyError.message }, { status: 400 });
      }
      
      return NextResponse.json({ success: true });
    }
    
    case 'unenroll': {
      if (!factorId) {
        return NextResponse.json({ error: 'Missing factorId' }, { status: 400 });
      }
      
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      return NextResponse.json({ success: true });
    }
    
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
