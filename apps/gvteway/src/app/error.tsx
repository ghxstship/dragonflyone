"use client";

import { useEffect } from "react";
import { PageLayout, Navigation, Footer, FooterColumn, FooterLink, Display, H2, Body, Button, SectionLayout, Alert, Stack, Container } from "@ghxstship/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => window.location.href = "/"}>HOME</Button>}
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Support">
            <FooterLink href="#">Help Center</FooterLink>
            <FooterLink href="#">Contact</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container>
          <Stack gap={8} className="mx-auto max-w-2xl">
            <Stack gap={4} className="text-center">
              <H2 className="text-white">Something Went Wrong</H2>
              <Body className="text-grey-400">
                We encountered an unexpected error. Please try again.
              </Body>
            </Stack>

            <Alert variant="error">
              {error.message || "An unexpected error occurred"}
            </Alert>

            <Stack gap={4} direction="horizontal" className="justify-center">
              <Button variant="solid" onClick={reset}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Go Home
              </Button>
            </Stack>
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
