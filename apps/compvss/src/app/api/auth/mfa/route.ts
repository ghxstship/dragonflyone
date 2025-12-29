export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const enrollSchema = z.object({
  action: z.literal('enroll'),
  friendlyName: z.string().optional(),
});

const verifySchema = z.object({
  action: z.literal('verify'),
  factorId: z.string().min(1),
  code: z.string().min(6).max(6),
});

const unenrollSchema = z.object({
  action: z.literal('unenroll'),
  factorId: z.string().min(1),
});

const mfaActionSchema = z.union([enrollSchema, verifySchema, unenrollSchema]);

export const runtime = 'nodejs';

/**
 * GET /api/auth/mfa - Get MFA status for the current user
 */
export async function GET() {
  try {
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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/auth/mfa - Enroll in MFA
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validatedData = mfaActionSchema.parse(body);
    const { action } = validatedData;
    
    switch (action) {
    case 'enroll': {
      const { friendlyName } = validatedData as z.infer<typeof enrollSchema>;
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
      const { factorId, code } = validatedData as z.infer<typeof verifySchema>;
      
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
      const { factorId: unenrollFactorId } = validatedData as z.infer<typeof unenrollSchema>;
      
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: unenrollFactorId,
      });
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      return NextResponse.json({ success: true });
    }
    
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
