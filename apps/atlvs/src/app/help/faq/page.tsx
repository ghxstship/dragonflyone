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
import { HelpCircle, ArrowRight, Bell, Rocket, CheckCircle, MessageSquare } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const comingSoonData = {
  title: "FAQ",
  tagline: "ANSWERS TO QUESTIONS YOU HAVEN'T EVEN ASKED YET",
  description: "We're compiling every question our users have ever asked (and some they were too afraid to ask). No more hunting through emails or waiting on hold.",
  features: [
    "Billing & subscription FAQs",
    "Feature-specific answers",
    "Troubleshooting guides",
    "Best practices Q&A",
    "Integration FAQs",
  ],
  previewQuestions: [
    "How do I upgrade my plan?",
    "Can I export my data?",
    "What integrations do you support?",
  ],
  eta: "Q1 2025",
};

export default function FaqComingSoonPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="min-h-[70vh] py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <HelpCircle className="size-10 text-brand-pink" />
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

            {/* Preview questions */}
            <Card inverted className="mt-8 w-full max-w-2xl border-2 border-ink-800 bg-ink-900">
              <Stack gap={0}>
                {comingSoonData.previewQuestions.map((question, idx) => (
                  <Stack
                    key={question}
                    direction="horizontal"
                    className={`items-center justify-between p-4 ${idx !== comingSoonData.previewQuestions.length - 1 ? "border-b border-ink-800" : ""}`}
                  >
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <MessageSquare className="size-4 text-grey-500" />
                      <Label size="sm" className="text-grey-400">{question}</Label>
                    </Stack>
                    <Label size="xs" className="text-grey-600">SOON</Label>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card inverted className="mt-8 border-2 border-ink-800 bg-ink-900 p-8">
              <Stack gap={4}>
                <Label size="xs" className="text-on-dark-muted">CATEGORIES WE&apos;RE COVERING</Label>
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
            <H3 className="text-ink-950">GOT A BURNING QUESTION?</H3>
            <Body size="lg" className="text-grey-600">
              Don&apos;t wait for the FAQ. Our support team responds faster than you can refresh your inbox. Try us.
            </Body>
            <NextLink href="/contact">
              <Button variant="outline" size="lg" icon={<ArrowRight />}>
                Ask Us Anything
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
