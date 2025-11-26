'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
    try {
      const response = await fetch('/api/auth/password/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Failed to reset password'); }
      setSuccess(true);
      setTimeout(() => router.push('/auth/signin'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-grey-100">
      <header className="py-6 px-8 border-b border-grey-200 bg-white"><Link href="/" className="font-heading text-h4 uppercase tracking-widest">COMPVSS</Link></header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 border border-grey-200">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-grey-100 rounded-full flex items-center justify-center"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
              <h1 className="font-heading text-h2 uppercase tracking-widest">Password Reset</h1>
              <p className="font-body text-body-md text-grey-600">Your password has been successfully reset. Redirecting to sign in...</p>
            </div>
          ) : (
            <>
              <div className="text-center"><h1 className="font-heading text-h2 uppercase tracking-widest">New Password</h1><p className="mt-2 font-body text-body-md text-grey-600">Enter your new password below.</p></div>
              {error && <div className="p-4 bg-grey-100 border border-grey-300"><p className="font-code text-mono-sm text-black uppercase tracking-wider">{error}</p></div>}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div><label htmlFor="password" className="font-heading text-h6-sm uppercase tracking-wider">New Password</label><input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors" placeholder="••••••••" /><p className="mt-1 font-code text-mono-xs text-grey-500">Minimum 8 characters</p></div>
                <div><label htmlFor="confirmPassword" className="font-heading text-h6-sm uppercase tracking-wider">Confirm Password</label><input id="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors" placeholder="••••••••" /></div>
                <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-black text-white font-heading text-h6-sm uppercase tracking-widest hover:bg-grey-800 disabled:bg-grey-400 transition-colors">{loading ? 'Resetting...' : 'Reset Password'}</button>
              </form>
              <div className="text-center"><Link href="/auth/signin" className="font-code text-mono-xs uppercase tracking-wider text-grey-600 hover:text-black transition-colors">Back to Sign In</Link></div>
            </>
          )}
        </div>
      </main>
      <footer className="py-6 px-8 border-t border-grey-200 bg-white"><div className="flex justify-center space-x-8"><Link href="/privacy" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Privacy</Link><Link href="/terms" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Terms</Link><Link href="/support" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Support</Link></div></footer>
    </div>
  );
}
