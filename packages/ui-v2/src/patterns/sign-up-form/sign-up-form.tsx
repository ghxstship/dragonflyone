/**
 * SignUpForm Pattern
 * Complete sign-up form with email/password/name
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

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export interface SignUpFormProps {
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
  onSubmit: (data: SignUpFormData) => void | Promise<void>;

  /**
   * Sign in handler
   */
  onSignIn?: () => void;

  /**
   * Terms link
   */
  termsLink?: string;

  /**
   * Privacy link
   */
  privacyLink?: string;

  /**
   * Additional class names
   */
  className?: string;
}

export const SignUpForm = forwardRef<HTMLFormElement, SignUpFormProps>(
  function SignUpForm(
    {
      title = 'Create Account',
      description = 'Sign up to get started',
      loading = false,
      error,
      onSubmit,
      onSignIn,
      termsLink = '/terms',
      privacyLink = '/privacy',
      className,
    },
    ref
  ) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError('');

      // Validate passwords match
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match');
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        setValidationError('Password must be at least 8 characters');
        return;
      }

      // Validate terms agreement
      if (!agreedToTerms) {
        setValidationError('You must agree to the terms and conditions');
        return;
      }

      await onSubmit({ name, email, password, confirmPassword, agreedToTerms });
    };

    const displayError = validationError || error;

    return (
      <Card className={cn('w-full max-w-md', className)}>
        <form ref={ref} onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent>
            <Flex direction="vertical" gap="4">
              {displayError && (
                <Alert variant="error" title="Sign up failed">
                  {displayError}
                </Alert>
              )}

              <Field label="Name" required>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="name"
                />
              </Field>

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

              <Field label="Password" required hint="Must be at least 8 characters">
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
              </Field>

              <Field label="Confirm Password" required>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
              </Field>

              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5"
                />
                <Text size="sm" className="text-text-secondary">
                  I agree to the{' '}
                  <a href={termsLink} className="text-brand-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href={privacyLink} className="text-brand-primary hover:underline">
                    Privacy Policy
                  </a>
                </Text>
              </label>
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
                Create Account
              </Button>

              {onSignIn && (
                <Text size="sm" className="text-center text-text-secondary">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="text-brand-primary hover:underline"
                    disabled={loading}
                  >
                    Sign in
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
