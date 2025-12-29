"use client";

/**
 * Solution Detail Page
 * Dynamic solution page by slug
 * Uses DetailPage template for consistent layout
 */

import { useParams, useRouter } from "next/navigation";
import { Check, ArrowRight, List, Star } from "lucide-react";
import {
  Stack,
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const SOLUTIONS: Record<string, { title: string; description: string; features: string[]; benefits: string[] }> = {
  "festivals": { title: "Festival Management", description: "Complete solution for music festivals and large-scale events", features: ["Multi-stage scheduling", "Vendor coordination", "Crowd management", "Artist management"], benefits: ["Reduce planning time by 60%", "Improve vendor communication", "Real-time crowd analytics", "Streamlined artist logistics"] },
  "corporate": { title: "Corporate Events", description: "Professional event management for corporate functions", features: ["Conference planning", "Executive briefings", "Team building events", "Product launches"], benefits: ["Impress stakeholders", "Seamless execution", "Brand consistency", "Measurable ROI"] },
  "concerts": { title: "Concert Production", description: "End-to-end concert production management", features: ["Tour management", "Venue coordination", "Technical production", "Merchandise tracking"], benefits: ["Scale across venues", "Consistent quality", "Efficient load-in/out", "Revenue optimization"] },
  "theater": { title: "Theater Productions", description: "Complete theater production management", features: ["Rehearsal scheduling", "Cast management", "Set design tracking", "Costume inventory"], benefits: ["Streamlined rehearsals", "Better cast coordination", "Efficient tech weeks", "Opening night success"] },
};

export default function SolutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const solution = SOLUTIONS[slug] || { title: "Solution", description: "Industry solution", features: [], benefits: [] };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-8 mb-8">
            <Body className="font-weight-bold text-grey-300 leading-relaxed">{solution.description}</Body>
          </Card>

          <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2">
            <div>
              <SectionHeader title="Key Features" />
              <div className="space-y-3 mt-4">
                {solution.features.map((feature, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center gap-3">
                      <Check className="size-5 text-primary" />
                      <Body>{feature}</Body>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <SectionHeader title="Benefits" />
              <div className="space-y-3 mt-4">
                {solution.benefits.map((benefit, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center gap-3">
                      <Check className="size-5 text-success" />
                      <Body>{benefit}</Body>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Grid>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Ready to transform your {solution.title.toLowerCase()}?</Body>
            <Body className="text-grey-400 mb-4">See how ATLVS can help your team</Body>
            <div className="flex gap-4 justify-center">
              <Button variant="solid" onClick={() => router.push("/demo")} icon={<ArrowRight className="size-4" />} iconPosition="right">Request Demo</Button>
              <Button variant="outline" onClick={() => router.push("/contact")}>Contact Sales</Button>
            </div>
          </Card>
        </Section>
      ),
    },
    {
      id: "case-studies",
      label: "Case Studies",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Success Stories" description="See how others have succeeded" />
          <Button variant="solid" className="mt-4" onClick={() => router.push("/case-studies")}>View Case Studies</Button>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Solutions", title: solution.title, description: solution.description }}
      backButton={{ label: "Solutions", href: "/solutions" }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Get Started</Button>}
    />
  );
}
