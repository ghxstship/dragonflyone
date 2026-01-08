/**
 * ResetPasswordForm Pattern
 * Password reset request form
 */

'use client';

import React, { forwardRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/card';
import { Field } from '../../components/field';
import { Input } from '../../primitives/input';
import { Button } from '../../primitives/button';
import { Flex } from '../../primitives/flex';
import { Text } from '../../primitives/text';
import { Alert } from '../../components/alert';
import { cn } from '../../utils/cn';

export interface ResetPasswordFormProps {
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
   * Success message
   */
  success?: string;

  /**
   * Submit handler
   */
  onSubmit: (email: string) => void | Promise<void>;

  /**
   * Back to sign in handler
   */
  onBackToSignIn?: () => void;

  /**
   * Additional class names
   */
  className?: string;
}

export const ResetPasswordForm = forwardRef<HTMLFormElement, ResetPasswordFormProps>(
  function ResetPasswordForm(
    {
      title = 'Reset Password',
      description = 'Enter your email to receive a password reset link',
      loading = false,
      error,
      success,
      onSubmit,
      onBackToSignIn,
      className,
    },
    ref
  ) {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(email);
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
                <Alert variant="error" title="Error">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" title="Success">
                  {success}
                </Alert>
              )}

              {!success && (
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
              )}
            </Flex>
          </CardContent>

          <CardFooter>
            <Flex direction="vertical" gap="3" className="w-full">
              {!success && (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Send Reset Link
                </Button>
              )}

              {onBackToSignIn && (
                <Text size="sm" className="text-center text-text-secondary">
                  <button
                    type="button"
                    onClick={onBackToSignIn}
                    className="text-brand-primary hover:underline"
                    disabled={loading}
                  >
                    ← Back to sign in
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
