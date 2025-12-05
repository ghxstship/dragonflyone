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
import { Book, ArrowRight, Bell, Rocket, CheckCircle } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const comingSoonData = {
  title: "GETTING STARTED",
  tagline: "YOUR PRODUCTION JOURNEY BEGINS HERE",
  description: "We're crafting the ultimate onboarding experience. Step-by-step guides, interactive walkthroughs, and everything you need to go from zero to production hero.",
  features: [
    "Interactive setup wizard",
    "Role-based onboarding paths",
    "Quick-start templates",
    "First project checklist",
  ],
  eta: "Q1 2025",
};

export default function GettingStartedComingSoonPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="min-h-[70vh] py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Book className="size-10 text-brand-pink" />
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

            <Card inverted className="mt-8 border-2 border-ink-800 bg-ink-900 p-8">
              <Stack gap={4}>
                <Label size="xs" className="text-on-dark-muted">WHAT&apos;S COOKING</Label>
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
            <H3 className="text-ink-950">IN THE MEANTIME...</H3>
            <Body size="lg" className="text-grey-600">
              Our support team is standing by to personally walk you through anything you need. Old school? Maybe. Effective? Absolutely.
            </Body>
            <NextLink href="/contact">
              <Button variant="outline" size="lg" icon={<ArrowRight />}>
                Talk to a Human
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
