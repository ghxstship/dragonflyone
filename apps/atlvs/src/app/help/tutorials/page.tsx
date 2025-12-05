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
import { Video, ArrowRight, Bell, Rocket, Play, CheckCircle } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const comingSoonData = {
  title: "VIDEO TUTORIALS",
  tagline: "LEARN BY WATCHING, NOT BY READING WALLS OF TEXT",
  description: "We're filming a complete video library that'll make you an ATLVS power user faster than you can say 'where did I put that spreadsheet again?'",
  features: [
    "Bite-sized 5-minute lessons",
    "Full workflow walkthroughs",
    "Pro tips from power users",
    "Live Q&A recordings",
  ],
  eta: "Q1 2025",
};

export default function TutorialsComingSoonPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="min-h-[70vh] py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Video className="size-10 text-brand-pink" />
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

            {/* Fake video player */}
            <Card inverted className="mt-8 aspect-video w-full max-w-2xl border-2 border-ink-800 bg-ink-900">
              <Stack className="flex h-full items-center justify-center">
                <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800 transition-all hover:border-brand-pink hover:bg-ink-700">
                  <Play className="size-8 text-brand-pink" />
                </Stack>
                <Label size="xs" className="mt-4 text-on-dark-muted">
                  PREVIEW COMING SOON
                </Label>
              </Stack>
            </Card>

            <Card inverted className="mt-8 border-2 border-ink-800 bg-ink-900 p-8">
              <Stack gap={4}>
                <Label size="xs" className="text-on-dark-muted">IN PRODUCTION</Label>
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
                  Get Early Access
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
            <H3 className="text-ink-950">PREFER THE LIVE VERSION?</H3>
            <Body size="lg" className="text-grey-600">
              Book a demo and get a personal walkthrough from someone who actually knows what they&apos;re talking about. No scripts, no fluff.
            </Body>
            <NextLink href="/demo">
              <Button variant="outline" size="lg" icon={<ArrowRight />}>
                Schedule a Demo
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
