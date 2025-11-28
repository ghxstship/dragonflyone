'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ghxstship/config/auth-context';
import {
  Display,
  Body,
  Button,
  Input,
  Alert,
  Stack,
  Card,
  Field,
  Checkbox,
  Label,
  AuthPage,
} from '@ghxstship/ui';
import NextLink from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage appName="GVTEWAY" background="black">
        {/* Auth Card - Pop Art Style */}
        <Card inverted variant="elevated" className="p-8">
          <Stack gap={8}>
            {/* Header */}
            <Stack gap={4} className="text-center">
              <Display size="lg" className="text-white">GVTEWAY</Display>
              <Body className="text-on-dark-muted">Sign in to your account</Body>
            </Stack>

            {/* Error Alert */}
            {error && <Alert variant="error">{error}</Alert>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap={6}>
                {/* Email Field */}
                <Field label="Email" inverted>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                    inverted
                  />
                </Field>

                {/* Password Field */}
                <Field label="Password" inverted>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    inverted
                  />
                </Field>

                {/* Remember Me & Forgot Password */}
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      inverted
                    />
                    <Label size="xs" className="text-on-dark-muted">Remember me</Label>
                  </Stack>
                  <NextLink href="/forgot-password">
                    <Button variant="ghost" size="sm" inverted className="text-on-dark-muted">
                      Forgot password?
                    </Button>
                  </NextLink>
                </Stack>

                {/* Primary CTA */}
                <Button
                  type="submit"
                  variant="solid"
                  size="lg"
                  fullWidth
                  inverted
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            {/* Sign Up Link */}
            <Stack className="text-center">
              <Body size="sm" className="text-on-dark-muted">
                Don&apos;t have an account?{' '}
                <NextLink href="/signup">
                  <Button variant="ghost" size="sm" inverted className="inline">
                    Sign up
                  </Button>
                </NextLink>
              </Body>
            </Stack>
          </Stack>
        </Card>
    </AuthPage>
  );
}
