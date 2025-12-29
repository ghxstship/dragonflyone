"use client";

/**
 * Case Studies Page
 * Customer success stories
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Building2, Users, TrendingUp, Award, List, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  summary: string;
  results: { metric: string; value: string }[];
  image: string;
  featured: boolean;
}

const DEMO_CASE_STUDIES: CaseStudy[] = [
  { id: "1", title: "How Festival Corp Managed 50K Attendees", company: "Festival Corp", industry: "Music Festivals", summary: "Learn how Festival Corp streamlined their production workflow and reduced costs by 40%.", results: [{ metric: "Cost Reduction", value: "40%" }, { metric: "Time Saved", value: "200hrs" }], image: "🎪", featured: true },
  { id: "2", title: "Corporate Events at Scale", company: "TechGiant Inc", industry: "Corporate Events", summary: "TechGiant manages 100+ corporate events annually with ATLVS.", results: [{ metric: "Events/Year", value: "100+" }, { metric: "Team Efficiency", value: "+60%" }], image: "🏢", featured: true },
  { id: "3", title: "Theater Production Excellence", company: "Broadway Stars", industry: "Theater", summary: "Broadway Stars transformed their production management process.", results: [{ metric: "Productions", value: "25" }, { metric: "On-Time Delivery", value: "99%" }], image: "🎭", featured: false },
  { id: "4", title: "Sports Event Management", company: "Championship League", industry: "Sports", summary: "Managing major sporting events across multiple venues.", results: [{ metric: "Venues", value: "12" }, { metric: "Attendees", value: "500K+" }], image: "🏟️", featured: false },
];

const INDUSTRIES = ["All", "Music Festivals", "Corporate Events", "Theater", "Sports"];

export default function CaseStudiesPage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const { data: caseStudies = [], isLoading, error, refetch } = useQuery({
    queryKey: ["case-studies"],
    queryFn: async () => {
      const response = await fetch("/api/case-studies");
      if (!response.ok) return DEMO_CASE_STUDIES;
      const data = await response.json();
      return data.caseStudies?.length ? data.caseStudies : DEMO_CASE_STUDIES;
    },
  });

  const filteredStudies = selectedIndustry === "All" ? caseStudies : caseStudies.filter((cs: CaseStudy) => cs.industry === selectedIndustry);
  const featuredStudies = caseStudies.filter((cs: CaseStudy) => cs.featured);

  const tabs = [
    {
      id: "all",
      label: "All Case Studies",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Case Studies" value={caseStudies.length.toString()} icon={<FileText className="size-5" />} />
            <StatCard label="Industries" value={new Set(caseStudies.map((cs: CaseStudy) => cs.industry)).size.toString()} icon={<Building2 className="size-5" />} />
            <StatCard label="Happy Customers" value="1,000+" icon={<Users className="size-5" />} />
          </Grid>

          <div className="flex gap-2 mb-6 flex-wrap">
            {INDUSTRIES.map((ind) => (
              <Button key={ind} variant={selectedIndustry === ind ? "solid" : "outline"} size="sm" onClick={() => setSelectedIndustry(ind)}>
                {ind}
              </Button>
            ))}
          </div>

          {filteredStudies.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="font-weight-medium font-weight-medium mb-2">No Case Studies Found</Body>
              <Body className="text-grey-400">Check back soon for more success stories</Body>
            </Card>
          ) : (
            <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
              {filteredStudies.map((cs: CaseStudy) => (
                <Card key={cs.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/case-studies/${cs.id}`)}>
                  <div className="flex items-start gap-4">
                    <div className="font-weight-bold">{cs.image}</div>
                    <div className="flex-1">
                      {cs.featured && <Badge variant="warning" className="mb-2">Featured</Badge>}
                      <Body className="font-weight-bold font-weight-medium">{cs.title}</Body>
                      <Body size="sm" className="text-grey-400 mb-2">{cs.company} • {cs.industry}</Body>
                      <Body className="text-grey-300 mb-4">{cs.summary}</Body>
                      <div className="flex gap-4">
                        {cs.results.map((result, idx) => (
                          <div key={idx} className="text-center">
                            <Body className="font-weight-bold text-primary">{result.value}</Body>
                            <Body size="sm" className="text-grey-500">{result.metric}</Body>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>
          )}
        </Section>
      ),
    },
    {
      id: "featured",
      label: "Featured",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Featured Success Stories" description="Our most impactful customer transformations" />
          <div className="space-y-6 mt-6">
            {featuredStudies.map((cs: CaseStudy) => (
              <Card key={cs.id} className="p-8 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/case-studies/${cs.id}`)}>
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{cs.image}</div>
                  <div className="flex-1">
                    <Badge variant="warning" className="mb-2">Featured</Badge>
                    <Body className="font-weight-bold font-weight-bold mb-2">{cs.title}</Body>
                    <Body size="sm" className="text-grey-400 mb-2">{cs.company} • {cs.industry}</Body>
                    <Body className="text-grey-300 mb-6">{cs.summary}</Body>
                    <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4">
                      {cs.results.map((result, idx) => (
                        <Card key={idx} className="p-4 text-center">
                          <Body className="font-weight-bold font-weight-bold text-primary">{result.value}</Body>
                          <Body size="sm" className="text-grey-500">{result.metric}</Body>
                        </Card>
                      ))}
                    </Grid>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Success Stories",
        title: "Case Studies",
        description: "See how leading organizations use ATLVS to transform their production workflows",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Request a Demo</Button>}
    />
  );
}
