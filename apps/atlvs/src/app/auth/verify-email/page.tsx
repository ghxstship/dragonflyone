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
  SectionLayout,
  Stack,
} from "@ghxstship/ui";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <PageLayout
      background="white"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md text-black">ATLVS</Display>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-black text-display-md">ATLVS</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="grey">
        <Stack gap={8} className="mx-auto max-w-md bg-white p-8 border border-grey-200 text-center">
          <Stack className="w-16 h-16 mx-auto bg-grey-200 rounded-full items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </Stack>
          <H2>Verify Your Email</H2>
          <Body className="text-grey-600">
            We&apos;ve sent a verification email to{" "}
            {email && <strong className="text-black">{email}</strong>}
            {!email && "your email address"}.
            Please click the link in the email to verify your account.
          </Body>
          <Stack gap={4}>
            <Body size="sm" className="text-grey-500">Didn&apos;t receive the email?</Body>
            <Button variant="ghost" onClick={() => alert('Verification email resent!')} className="text-black hover:text-grey-600">
              Resend Verification Email
            </Button>
          </Stack>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signin'} className="text-grey-600 hover:text-black">
            Back to Sign In
          </Button>
        </Stack>
      </SectionLayout>
    </PageLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
