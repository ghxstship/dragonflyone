"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout, Navigation, Footer, FooterColumn, FooterLink, Display, H2, Body, Button, SectionLayout, Stack, Container } from "@ghxstship/ui";

export default function NotFound() {
  const router = useRouter();

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={
            <Link href="/">
              <Button variant="outlineWhite" size="sm">HOME</Button>
            </Link>
          }
        />
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container>
          <Stack gap={8} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <Display size="xl" className="text-white">404</Display>
            <H2 className="text-white">Page Not Found</H2>
            <Body className="max-w-md text-ink-400">
              The page you are looking for doesn&apos;t exist or has been moved.
            </Body>
            <Stack gap={4} direction="horizontal">
              <Link href="/">
                <Button variant="solid">Go Home</Button>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </Stack>
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
