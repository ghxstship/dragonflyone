'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@ghxstship/config';

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/oauth/${provider}`, { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('OAuth sign-in is not yet configured.');
        setLoading(false);
      }
    } catch (err) {
      setError('OAuth sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-grey-100">
      <header className="py-6 px-8 border-b border-grey-200 bg-white">
        <Link href="/" className="font-heading text-h4 uppercase tracking-widest">
          ATLVS
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 border border-grey-200">
          <div className="text-center">
            <h1 className="font-heading text-h2 uppercase tracking-widest">Welcome Back</h1>
            <p className="mt-2 font-body text-body-md text-grey-600">Sign in to access your projects</p>
          </div>

          {error && (
            <div className="p-4 bg-grey-100 border border-grey-300">
              <p className="font-code text-mono-sm text-black uppercase tracking-wider">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="font-heading text-h6-sm uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="font-heading text-h6-sm uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="font-code text-mono-xs uppercase tracking-wider text-grey-600 hover:text-black transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 block w-full px-4 py-3 border border-grey-300 font-body text-body-md focus:outline-none focus:border-black transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 border-grey-300 focus:ring-black"
                />
                <label htmlFor="remember-me" className="ml-2 font-body text-body-sm text-grey-600">
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-black text-white font-heading text-h6-sm uppercase tracking-widest hover:bg-grey-800 disabled:bg-grey-400 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-grey-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white font-code text-mono-xs uppercase tracking-wider text-grey-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex items-center justify-center py-3 px-4 border border-grey-300 font-heading text-h6-sm uppercase tracking-wider hover:bg-grey-100 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('apple')}
              disabled={loading}
              className="flex items-center justify-center py-3 px-4 border border-grey-300 font-heading text-h6-sm uppercase tracking-wider hover:bg-grey-100 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>

          <div className="text-center space-y-4">
            <p className="font-body text-body-sm text-grey-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-heading text-h6-sm uppercase tracking-wider text-black hover:underline">
                Sign Up
              </Link>
            </p>
            <Link href="/auth/magic-link" className="font-code text-mono-xs uppercase tracking-wider text-grey-600 hover:text-black transition-colors">
              Sign in with Magic Link
            </Link>
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
