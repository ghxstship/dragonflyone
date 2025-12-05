import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Card,
  Body,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
} from "@ghxstship/ui";
import { FileText, ArrowRight, Bell, Rocket, CheckCircle, Search } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const comingSoonData = {
  title: "DOCUMENTATION",
  tagline: "THE MANUAL YOU'LL ACTUALLY WANT TO READ",
  description: "We're building comprehensive docs that don't require a PhD to understand. Every feature, every integration, every 'how the heck do I do this?' moment - covered.",
  features: [
    "Searchable knowledge base",
    "Feature deep-dives",
    "Integration guides",
    "Troubleshooting playbooks",
    "Best practices library",
  ],
  eta: "Q1 2025",
};

export default function DocsComingSoonPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="min-h-[70vh] py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <FileText className="size-10 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              COMING SOON
            </Label>
            <Display size="lg" className="text-white">
              {comingSoonData.title}
            </Display>
            <Body size="lg" className="max-w-2xl text-brand-pink">
              {comingSoonData.tagline}
            </Body>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {comingSoonData.description}
            </Body>

            {/* Fake search bar */}
            <Card inverted className="mt-8 w-full max-w-2xl border-2 border-ink-800 bg-ink-900 p-4">
              <Stack direction="horizontal" gap={3} className="items-center">
                <Search className="size-5 text-grey-500" />
                <Body size="sm" className="text-grey-500">Search documentation...</Body>
                <Label size="xs" className="ml-auto border-2 border-ink-700 px-2 py-1 text-grey-500">
                  SOON
                </Label>
              </Stack>
            </Card>

            <Card inverted className="mt-8 border-2 border-ink-800 bg-ink-900 p-8">
              <Stack gap={4}>
                <Label size="xs" className="text-on-dark-muted">WHAT WE&apos;RE DOCUMENTING</Label>
                <Stack gap={3}>
                  {comingSoonData.features.map((feature) => (
                    <Stack key={feature} direction="horizontal" gap={3} className="items-center">
                      <CheckCircle className="size-4 text-brand-pink" />
                      <Label size="sm" className="text-white">{feature}</Label>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>

            <Stack direction="horizontal" gap={4} className="mt-8">
              <NextLink href="/contact">
                <Button variant="pop" size="lg" icon={<Bell />}>
                  Notify Me When Ready
                </Button>
              </NextLink>
              <NextLink href="/help">
                <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                  Back to Help Center
                </Button>
              </NextLink>
            </Stack>

            <Stack direction="horizontal" gap={2} className="mt-4 items-center">
              <Rocket className="size-4 text-on-dark-muted" />
              <Label size="xs" className="text-on-dark-muted">
                Expected: {comingSoonData.eta}
              </Label>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Meanwhile CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <H3 className="text-ink-950">NEED ANSWERS NOW?</H3>
            <Body size="lg" className="text-grey-600">
              While we&apos;re writing the docs, our support team has all the answers. They&apos;re basically walking encyclopedias with better personalities.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="outline" size="lg" icon={<ArrowRight />}>
                  Contact Support
                </Button>
              </NextLink>
              <NextLink href="/docs/api">
                <Button variant="outline" size="lg">
                  API Docs (Available Now)
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
