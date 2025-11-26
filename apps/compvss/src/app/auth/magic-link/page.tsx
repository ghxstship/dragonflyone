'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/magic-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error('Failed to send magic link');
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-grey-100">
      <header className="py-6 px-8 border-b border-grey-200 bg-white"><Link href="/" className="font-heading text-h4 uppercase tracking-widest">COMPVSS</Link></header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 border border-grey-200">
          {submitted ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-grey-100 rounded-full flex items-center justify-center"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
              <h1 className="font-heading text-h2 uppercase tracking-widest">Check Your Email</h1>
              <p className="font-body text-body-md text-grey-600">We&apos;ve sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.</p>
              <p className="font-code text-mono-xs text-grey-500 uppercase tracking-wider">Link expires in 1 hour</p>
              <button onClick={() => setSubmitted(false)} className="font-code text-mono-xs uppercase tracking-wider text-grey-600 hover:text-black transition-colors">Use a different email</button>
            </div>
          ) : (
            <>
              <div className="text-center"><h1 className="font-heading text-h2 uppercase tracking-widest">Magic Link</h1><p className="mt-2 font-body text-body-md text-grey-600">Sign in without a password. We&apos;ll email you a magic link.</p></div>
              {error && <div className="p-4 bg-grey-100 border border-grey-300"><p className="font-code text-mono-sm text-black uppercase tracking-wider">{error}</p></div>}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div><label htmlFor="email" className="font-heading text-h6-sm uppercase tracking-wider">Email Address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors" placeholder="you@company.com" /></div>
                <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-black text-white font-heading text-h6-sm uppercase tracking-widest hover:bg-grey-800 disabled:bg-grey-400 transition-colors">{loading ? 'Sending...' : 'Send Magic Link'}</button>
              </form>
              <div className="text-center space-y-4"><Link href="/auth/signin" className="block font-code text-mono-xs uppercase tracking-wider text-grey-600 hover:text-black transition-colors">Sign in with password instead</Link><p className="font-body text-body-sm text-grey-600">Don&apos;t have an account? <Link href="/auth/signup" className="font-heading text-h6-sm uppercase tracking-wider text-black hover:underline">Sign Up</Link></p></div>
            </>
          )}
        </div>
      </main>
      <footer className="py-6 px-8 border-t border-grey-200 bg-white"><div className="flex justify-center space-x-8"><Link href="/privacy" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Privacy</Link><Link href="/terms" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Terms</Link><Link href="/support" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Support</Link></div></footer>
    </div>
  );
}
