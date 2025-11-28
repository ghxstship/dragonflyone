"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import {
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
  H2,
  Body,
  Button,
  SectionLayout,
  Stack,
  Card,
} from "@ghxstship/ui";
import NextLink from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <Stack gap={8} className="mx-auto max-w-md">
      <Card variant="elevated" className="p-8 text-center">
        <Stack gap={6}>
          <Card className="mx-auto flex size-16 items-center justify-center">
            <Mail className="size-8" />
          </Card>
          <H2 className="text-black">Verify Your Email</H2>
          <Body className="text-muted">
            We&apos;ve sent a verification email to{" "}
            {email && <strong className="text-black">{email}</strong>}
            {!email && "your email address"}.
            Please click the link in the email to verify your account.
          </Body>
          <Stack gap={4}>
            <Body size="sm" className="text-muted">Didn&apos;t receive the email?</Body>
            <Button variant="ghost" onClick={() => alert('Verification email resent!')}>
              Resend Verification Email
            </Button>
          </Stack>
          <NextLink href="/auth/signin">
            <Button variant="ghost" size="sm">
              Back to Sign In
            </Button>
          </NextLink>
        </Stack>
      </Card>
    </Stack>
  );
}

export default function VerifyEmailPage() {
  return (
    <PageLayout
      background="white"
      header={
        <Navigation
          logo={<Body className="font-display">COMPVSS</Body>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Body className="font-display">COMPVSS</Body>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
            <FooterLink href="/support">Support</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="grey">
        <Suspense fallback={
          <Stack gap={8} className="mx-auto max-w-md">
            <Card variant="elevated" className="p-8 text-center">
              <Stack gap={6}>
                <Card className="mx-auto flex size-16 items-center justify-center">
                  <Mail className="size-8" />
                </Card>
                <H2 className="text-black">Verify Your Email</H2>
                <Body className="text-muted">Loading...</Body>
              </Stack>
            </Card>
          </Stack>
        }>
          <VerifyEmailContent />
        </Suspense>
      </SectionLayout>
    </PageLayout>
  );
}
