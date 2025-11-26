'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  return (
    <div className="min-h-screen flex flex-col bg-grey-100">
      <header className="py-6 px-8 border-b border-grey-200 bg-white">
        <Link href="/" className="font-heading text-h4 uppercase tracking-widest">
          ATLVS
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 border border-grey-200">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-grey-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="font-heading text-h2 uppercase tracking-widest">Verify Your Email</h1>
            <p className="font-body text-body-md text-grey-600">
              We&apos;ve sent a verification email to{' '}
              {email && <strong>{email}</strong>}
              {!email && 'your email address'}. 
              Please click the link in the email to verify your account.
            </p>
            <div className="space-y-4 pt-4">
              <p className="font-code text-mono-xs text-grey-500 uppercase tracking-wider">
                Didn&apos;t receive the email?
              </p>
              <button
                onClick={() => {
                  // TODO: Implement resend verification email
                  alert('Verification email resent!');
                }}
                className="font-heading text-h6-sm uppercase tracking-wider text-black hover:underline"
              >
                Resend Verification Email
              </button>
            </div>
            <div className="pt-4">
              <Link
                href="/auth/signin"
                className="font-code text-mono-xs uppercase tracking-wider text-grey-600 hover:text-black transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 border-t border-grey-200 bg-white">
        <div className="flex justify-center space-x-8">
          <Link href="/privacy" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Privacy</Link>
          <Link href="/terms" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Terms</Link>
          <Link href="/support" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Support</Link>
        </div>
      </footer>
    </div>
  );
}
