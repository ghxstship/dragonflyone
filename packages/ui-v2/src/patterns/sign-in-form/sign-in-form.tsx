/**
 * SignInForm Pattern
 * Complete sign-in form with email/password
 */

'use client';

import React, { forwardRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/card';
import { Field } from '../../components/field';
import { Input } from '../../primitives/input';
import { Button } from '../../primitives/button';
import { Checkbox } from '../../primitives/checkbox';
import { Flex } from '../../primitives/flex';
import { Text } from '../../primitives/text';
import { Alert } from '../../components/alert';
import { cn } from '../../utils/cn';

export interface SignInFormProps {
  /**
   * Form title
   */
  title?: string;

  /**
   * Form description
   */
  description?: string;

  /**
   * Whether form is loading
   */
  loading?: boolean;

  /**
   * Error message
   */
  error?: string;

  /**
   * Submit handler
   */
  onSubmit: (data: { email: string; password: string; rememberMe: boolean }) => void | Promise<void>;

  /**
   * Forgot password handler
   */
  onForgotPassword?: () => void;

  /**
   * Sign up handler
   */
  onSignUp?: () => void;

  /**
   * Additional class names
   */
  className?: string;
}

export const SignInForm = forwardRef<HTMLFormElement, SignInFormProps>(
  function SignInForm(
    {
      title = 'Sign In',
      description = 'Enter your credentials to access your account',
      loading = false,
      error,
      onSubmit,
      onForgotPassword,
      onSignUp,
      className,
    },
    ref
  ) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit({ email, password, rememberMe });
    };

    return (
      <Card className={cn('w-full max-w-md', className)}>
        <form ref={ref} onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent>
            <Flex direction="vertical" gap="4">
              {error && (
                <Alert variant="error" title="Sign in failed">
                  {error}
                </Alert>
              )}

              <Field label="Email" required>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </Field>

              <Field label="Password" required>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
              </Field>

              <Flex align="center" justify="between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <Text size="sm" className="text-text-secondary">
                    Remember me
                  </Text>
                </label>

                {onForgotPassword && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-brand-primary hover:underline"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                )}
              </Flex>
            </Flex>
          </CardContent>

          <CardFooter>
            <Flex direction="vertical" gap="3" className="w-full">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Sign In
              </Button>

              {onSignUp && (
                <Text size="sm" className="text-center text-text-secondary">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="text-brand-primary hover:underline"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </Text>
              )}
            </Flex>
          </CardFooter>
        </form>
      </Card>
    );
  }
);
