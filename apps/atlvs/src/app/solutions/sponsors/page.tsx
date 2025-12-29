"use client";

import { useRouter } from "next/navigation";
import { Award, Check, ArrowRight, List } from "lucide-react";
import { Body, Button, Card, Grid, DetailPage, Section, SectionHeader } from "@ghxstship/ui";
import { Stack } from "@ghxstship/ui";

const FEATURES = ["Sponsorship management", "ROI tracking", "Brand activation", "Analytics dashboard"];
const BENEFITS = ["Maximize exposure", "Track performance", "Better engagement", "Data-driven decisions"];

export default function SponsorsSolutionPage() {
  const router = useRouter();
  const tabs = [{
    id: "overview", label: "Overview", icon: <List className="size-4" />,
    content: (
      <Section>
        <Card className="p-8 mb-8"><Body className="text-h5-md text-grey-300">Specialized tools for sponsors in the live events industry.</Body></Card>
        <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2">
          <div><SectionHeader title="Features" /><Stack gap={3} className="mt-4">{FEATURES.map((f, i) => <Stack key={i} direction="horizontal" gap={3} className="items-center"><Check className="size-5 text-primary" /><Body>{f}</Body></Stack>)}</Stack></div>
          <div><SectionHeader title="Benefits" /><Stack gap={3} className="mt-4">{BENEFITS.map((b, i) => <Stack key={i} direction="horizontal" gap={3} className="items-center"><Check className="size-5 text-success" /><Body>{b}</Body></Stack>)}</Stack></div>
        </Grid>
        <Card className="p-8 mt-8 text-center"><Body className="font-weight-bold text-h5-md mb-4">Ready to get started?</Body><Button variant="solid" onClick={() => router.push("/demo")} icon={<ArrowRight className="size-4" />} iconPosition="right">Request Demo</Button></Card>
      </Section>
    ),
  }];
  return <DetailPage header={{ kicker: "Solutions", title: "For Sponsors", description: "Professional tools for sponsors" }} backButton={{ label: "Solutions", href: "/solutions" }} tabs={tabs} actions={<Button variant="solid" onClick={() => router.push("/demo")}>Get Started</Button>} />;
}
