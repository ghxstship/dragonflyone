"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  Body,
  Button,
  Stack,
  Card,
  Section,
  Container,
  Label,
  LoadingSpinner,
} from "@ghxstship/ui";
import { Mail } from "lucide-react";
import NextLink from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <Card inverted variant="elevated" className="w-full max-w-md p-8">
      <Stack gap={8} className="text-center">
        {/* Icon */}
        <Card inverted className="mx-auto flex size-16 items-center justify-center">
          <Mail className="size-8 text-white" />
        </Card>
        
        <Stack gap={4}>
          <H2 className="text-white">Verify Your Email</H2>
          <Body className="text-on-dark-muted">
            We&apos;ve sent a verification email to{" "}
            {email && <strong className="text-white">{email}</strong>}
            {!email && "your email address"}.
            Please click the link in the email to verify your account.
          </Body>
        </Stack>
        
        <Stack gap={4}>
          <Label size="xs" className="text-on-dark-disabled">
            Didn&apos;t receive the email?
          </Label>
          
          <Button
            variant="outlineInk"
            size="lg"
            fullWidth
            onClick={() => alert('Verification email resent!')}
          >
            Resend Verification Email
          </Button>
        </Stack>
        
        <NextLink href="/auth/signin">
          <Button variant="ghost" size="sm" inverted className="text-on-dark-muted hover:text-white">
            Back to Sign In
          </Button>
        </NextLink>
      </Stack>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-white">GVTEWAY</Display>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="flex min-h-[80vh] items-center justify-center py-12">
        <Container className="w-full max-w-md">
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
            <VerifyEmailContent />
          </Suspense>
        </Container>
      </Section>
    </PageLayout>
  );
}
