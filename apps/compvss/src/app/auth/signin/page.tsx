'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Display, Body, Button, Input, Container, Stack, Card } from '@ghxstship/ui';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    document.cookie = 'auth-token=dummy-token; path=/';
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <Container className="flex min-h-screen items-center justify-center bg-black">
      <Card className="w-full max-w-md border-2 border-white bg-black p-8">
        <Display className="mb-8 text-white">COMPVSS</Display>
        <form onSubmit={handleSignIn}>
          <Stack gap={6}>
            <Stack gap={2}>
              <Body className="text-white">Email</Body>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </Stack>
            <Stack gap={2}>
              <Body className="text-white">Password</Body>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </Stack>
            <Button type="submit" variant="solid" disabled={loading} className="w-full">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}
