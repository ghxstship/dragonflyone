'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  Body,
  Label,
  Button,
  Field,
  Input,
  Card,
  Stack,
  Checkbox,
  Link,
  Alert,
  Form,
} from '@ghxstship/ui';
import { useAuth } from '@ghxstship/config/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
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
    <Section className="min-h-screen flex items-center justify-center bg-black">
      <Container size="sm">
        <Card className="p-8">
          <Stack className="text-center mb-8">
            <Display size="md" className="mb-2">
              GVTEWAY
            </Display>
            <Body className="text-ink-500">Sign in to your account</Body>
          </Stack>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}><Stack gap={6}>
            <Field label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </Field>

            <Field label="Password" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </Field>

            <Stack direction="horizontal" className="items-center justify-between">
              <Checkbox label="Remember me" />
              <Link href="/forgot-password" className="text-body-sm">
                Forgot password?
              </Link>
            </Stack>

            <Button
              type="submit"
              variant="solid"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Stack></Form>

          <Stack className="mt-6 text-center">
            <Body className="text-ink-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-bold">
                Sign up
              </Link>
            </Body>
          </Stack>
        </Card>
      </Container>
    </Section>
  );
}
