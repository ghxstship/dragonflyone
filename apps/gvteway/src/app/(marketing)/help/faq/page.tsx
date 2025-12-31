"use client";

/**
 * FAQ Page - GVTEWAY
 * Frequently asked questions for event-goers and consumers
 * Uses DetailPage template for consistent layout
 * Content sourced from centralized marketing-content configuration
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, ChevronDown, ChevronUp, Search, List, Tag } from "lucide-react";
import {
  Body, Button, Card, Input, DetailPage, Section, SectionHeader, Box, Stack} from "@ghxstship/ui";
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
  'consumer-ticketing': 'Tickets & Events',
  'billing-pricing': 'Payments',
  'security-compliance': 'Security',
  'integrations': 'App Features',
};

const PLATFORM_FAQS: LocalFAQ[] = getFAQsByPlatform('gvteway').map(faq => ({
  id: faq.id,
  question: faq.question,
  answer: faq.answer,
  category: CATEGORY_LABELS[faq.category] || faq.category,
}));

const CATEGORIES = ['All', ...Array.from(new Set(PLATFORM_FAQS.map(f => f.category)))];

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

  const tabs = [
    {
      id: "faq",
      label: "FAQ",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-4 mb-6">
            <Box className="flex items-center gap-4 flex-wrap">
              <Box className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
                <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </Box>
              <Box className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </Button>
                ))}
              </Box>
            </Box>
          </Card>

          {filteredFAQs.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="font-weight-medium text-h5-md mb-2">No Questions Found</Body>
              <Body className="text-on-dark-muted">Try a different search term or category</Body>
            </Card>
          ) : (
            <Stack gap={4}>
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="overflow-hidden">
                  <Button variant="ghost" className="w-full p-6 text-left flex items-center justify-between" onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                    <Box className="flex items-center gap-3">
                      <HelpCircle className="size-5 text-primary" />
                      <Body className="font-weight-medium">{faq.question}</Body>
                    </Box>
                    {expandedId === faq.id ? <ChevronUp className="size-5 text-on-dark-muted" /> : <ChevronDown className="size-5 text-on-dark-muted" />}
                  </Button>
                  {expandedId === faq.id && (
                    <Box className="px-6 pb-6 pt-0">
                      <Body className="text-on-dark-secondary pl-8">{faq.answer}</Body>
                    </Box>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </Section>
      ),
    },
    {
      id: "categories",
      label: "By Category",
      icon: <Tag className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Browse by Category" description="Find answers organized by topic" />
          <Stack gap={6} className="mt-6">
            {CATEGORIES.filter((c) => c !== "All").map((category) => {
              const categoryFAQs = PLATFORM_FAQS.filter((f) => f.category === category);
              return (
                <Card key={category} className="p-6">
                  <Body className="font-weight-bold text-h5-md mb-4">{category} ({categoryFAQs.length})</Body>
                  <Stack gap={2}>
                    {categoryFAQs.map((faq) => (
                      <Button key={faq.id} variant="ghost" className="w-full justify-start" onClick={() => { setSelectedCategory(category); setExpandedId(faq.id); }}>
                        <HelpCircle className="size-4 mr-2" />
                        {faq.question}
                      </Button>
                    ))}
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Help",
        title: "Frequently Asked Questions",
        description: `Find answers to ${PLATFORM_FAQS.length} common questions`,
      }}
      backButton={{ label: "Help Center", href: "/help" }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/support/chat")}>Contact Support</Button>}
    />
  );
}
