'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', agreeToTerms: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
    if (!formData.agreeToTerms) { setError('You must agree to the terms and conditions'); setLoading(false); return; }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-grey-100">
      <header className="py-6 px-8 border-b border-grey-200 bg-white">
        <Link href="/" className="font-heading text-h4 uppercase tracking-widest">COMPVSS</Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 border border-grey-200">
          <div className="text-center">
            <h1 className="font-heading text-h2 uppercase tracking-widest">Create Account</h1>
            <p className="mt-2 font-body text-body-md text-grey-600">Join COMPVSS to manage your crew</p>
          </div>
          {error && <div className="p-4 bg-grey-100 border border-grey-300"><p className="font-code text-mono-sm text-black uppercase tracking-wider">{error}</p></div>}
          <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-4">
              <div><label htmlFor="firstName" className="font-heading text-h6-sm uppercase tracking-wider">First Name</label><input id="firstName" name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors" /></div>
              <div><label htmlFor="lastName" className="font-heading text-h6-sm uppercase tracking-wider">Last Name</label><input id="lastName" name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors" /></div>
            </div>
            <div><label htmlFor="email" className="font-heading text-h6-sm uppercase tracking-wider">Email Address</label><input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors" placeholder="you@company.com" /></div>
            <div><label htmlFor="password" className="font-heading text-h6-sm uppercase tracking-wider">Password</label><input id="password" name="password" type="password" autoComplete="new-password" required value={formData.password} onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors" placeholder="••••••••" /><p className="mt-1 font-code text-mono-xs text-grey-500">Minimum 8 characters</p></div>
            <div><label htmlFor="confirmPassword" className="font-heading text-h6-sm uppercase tracking-wider">Confirm Password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors" placeholder="••••••••" /></div>
            <div className="flex items-start"><input id="agreeToTerms" name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleChange} className="mt-1 h-4 w-4 border-grey-300 focus:ring-black" /><label htmlFor="agreeToTerms" className="ml-2 font-body text-body-sm text-grey-600">I agree to the <Link href="/terms" className="text-black hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-black hover:underline">Privacy Policy</Link></label></div>
            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-black text-white font-heading text-h6-sm uppercase tracking-widest hover:bg-grey-800 disabled:bg-grey-400 transition-colors">{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form>
          <div className="text-center"><p className="font-body text-body-sm text-grey-600">Already have an account? <Link href="/auth/signin" className="font-heading text-h6-sm uppercase tracking-wider text-black hover:underline">Sign In</Link></p></div>
        </div>
      </main>
      <footer className="py-6 px-8 border-t border-grey-200 bg-white"><div className="flex justify-center space-x-8"><Link href="/privacy" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Privacy</Link><Link href="/terms" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Terms</Link><Link href="/support" className="font-code text-mono-xs uppercase tracking-wider text-grey-500 hover:text-black">Support</Link></div></footer>
    </div>
  );
}
