"use client";

/**
 * FAQ Page - 2026 Landing Page Best Practices
 * Frequently asked questions
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 * Content sourced from centralized marketing-content configuration
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, Phone, Mail } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Body, Button, Card, Grid, Input, Stack, Box
} from "@ghxstship/ui";
import { getFAQsByPlatform } from "@ghxstship/config/marketing-content";

interface LocalFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'all': 'All',
  'getting-started': 'Getting Started',
  'competitive-comparison': 'Comparisons',
  'financial-workflows': 'Finance',
  'production-operations': 'Production',
  'consumer-ticketing': 'Ticketing',
  'billing-pricing': 'Billing',
  'security-compliance': 'Security',
  'integrations': 'Integrations',
  'team-collaboration': 'Team',
  'data-export': 'Data & Export',
};

const PLATFORM_FAQS: LocalFAQ[] = getFAQsByPlatform('atlvs').map(faq => ({
  id: faq.id,
  question: faq.question,
  answer: faq.answer,
  category: CATEGORY_LABELS[faq.category] || faq.category,
}));

const CATEGORIES = ['All', ...Array.from(new Set(PLATFORM_FAQS.map(f => f.category)))];

const SUPPORT_OPTIONS = [
  { id: "chat", icon: <MessageSquare className="size-8" />, title: "Live Chat", description: "Chat with our support team in real-time." },
  { id: "phone", icon: <Phone className="size-8" />, title: "Phone Support", description: "Call us for immediate assistance." },
  { id: "email", icon: <Mail className="size-8" />, title: "Email Support", description: "Send us a detailed message anytime." },
];

export default function FAQPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = PLATFORM_FAQS.filter((faq) => {
    const matchesSearch = !search || faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="Help"
              title="Frequently Asked Questions"
              description={`Find answers to ${PLATFORM_FAQS.length} common questions about ATLVS.`}
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "View Documentation",
                onClick: () => router.push("/docs"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "search",
          background: "ink",
          content: (
            <Container size="2xl" className="py-12">
              <Card className="p-6 border-2 border-border rounded-card">
                <Stack gap={4}>
                  <Box className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-muted" />
                    <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-14" />
                  </Box>
                  <Box className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((cat) => (
                      <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                        {cat}
                      </Button>
                    ))}
                  </Box>
                </Stack>
              </Card>
            </Container>
          ),
        },
        {
          id: "faqs",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Questions</Body>
                  <Body className="text-white font-weight-bold text-h3-md">
                    {filteredFAQs.length} {filteredFAQs.length === 1 ? "Result" : "Results"}
                  </Body>
                </Stack>

                {filteredFAQs.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-border rounded-card">
                    <HelpCircle className="size-16 text-text-disabled mx-auto mb-4" />
                    <Body className="text-white font-weight-bold mb-2">No Questions Found</Body>
                    <Body className="text-text-muted mb-4">Try a different search term or category</Body>
                    <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>Clear Filters</Button>
                  </Card>
                ) : (
                  <Stack gap={4}>
                    {filteredFAQs.map((faq) => (
                      <Card key={faq.id} className="border-2 border-border rounded-card overflow-hidden">
                        <Button variant="ghost" className="w-full p-6 text-left flex items-center justify-between" onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                          <Box className="flex items-center gap-3">
                            <HelpCircle className="size-5 text-primary flex-shrink-0" />
                            <Body className="text-white font-weight-medium">{faq.question}</Body>
                          </Box>
                          {expandedId === faq.id ? <ChevronUp className="size-5 text-text-muted flex-shrink-0" /> : <ChevronDown className="size-5 text-text-muted flex-shrink-0" />}
                        </Button>
                        {expandedId === faq.id && (
                          <Box className="px-6 pb-6 pt-0">
                            <Body className="text-text-secondary pl-8">{faq.answer}</Body>
                          </Box>
                        )}
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "support",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Support</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Still Need Help?</Body>
                  <Body className="text-text-muted">Our support team is here to assist you</Body>
                </Stack>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                  {SUPPORT_OPTIONS.map((option) => (
                    <Card key={option.id} className="p-6 border-2 border-border rounded-card pop-card text-center cursor-pointer" onClick={() => router.push("/contact")}>
                      <Box className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4">
                        {option.icon}
                      </Box>
                      <Body className="text-white font-weight-bold mb-2">{option.title}</Body>
                      <Body size="sm" className="text-text-muted">{option.description}</Body>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Cannot Find Your Answer?"
              description="Our support team is available 24/7 to help you with any questions."
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "View Documentation",
                onClick: () => router.push("/docs"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
