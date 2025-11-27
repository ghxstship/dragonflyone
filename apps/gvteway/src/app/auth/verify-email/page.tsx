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
    <Stack gap={8} className="mx-auto max-w-md text-center">
      <Stack className="w-16 h-16 mx-auto bg-grey-800 rounded-full items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </Stack>
      <H2 className="text-white">Verify Your Email</H2>
      <Body className="text-grey-400">
        We&apos;ve sent a verification email to{" "}
        {email && <strong className="text-white">{email}</strong>}
        {!email && "your email address"}.
        Please click the link in the email to verify your account.
      </Body>
      <Stack gap={4}>
        <Body size="sm" className="text-grey-500">Didn&apos;t receive the email?</Body>
        <Button variant="ghost" onClick={() => alert('Verification email resent!')} className="text-white hover:text-grey-400">
          Resend Verification Email
        </Button>
      </Stack>
      <Button variant="ghost" size="sm" onClick={() => window.location.href = '/auth/signin'} className="text-grey-400 hover:text-white">
        Back to Sign In
      </Button>
    </Stack>
  );
}

export default function VerifyEmailPage() {
  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<></>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Legal">
            <FooterLink href="#">Privacy</FooterLink>
            <FooterLink href="#">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Suspense fallback={<Stack gap={8} className="mx-auto max-w-md text-center"><Body className="text-grey-400">Loading...</Body></Stack>}>
          <VerifyEmailContent />
        </Suspense>
      </SectionLayout>
    </PageLayout>
  );
}
