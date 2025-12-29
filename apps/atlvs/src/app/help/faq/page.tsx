"use client";

/**
 * FAQ Page
 * Frequently asked questions
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, ChevronDown, ChevronUp, Search, List, Tag } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Input,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQ[] = [
  { id: "1", question: "How do I create a new project?", answer: "Navigate to Projects in the sidebar and click 'New Project'. Fill in the required details and click Create.", category: "Getting Started" },
  { id: "2", question: "How do I invite team members?", answer: "Go to Settings > Team and click 'Invite Member'. Enter their email address and select their role.", category: "Team" },
  { id: "3", question: "Can I integrate with other tools?", answer: "Yes! ATLVS integrates with 100+ tools including Slack, Google Calendar, Salesforce, and more. Visit Settings > Integrations.", category: "Integrations" },
  { id: "4", question: "How do I export my data?", answer: "Go to Settings > Export and select the data you want to export. Choose your format and click Export.", category: "Data" },
  { id: "5", question: "What payment methods do you accept?", answer: "We accept all major credit cards, ACH transfers, and wire transfers for enterprise accounts.", category: "Billing" },
  { id: "6", question: "How do I cancel my subscription?", answer: "Go to Settings > Billing and click 'Cancel Subscription'. Your data will be retained for 30 days.", category: "Billing" },
  { id: "7", question: "Is my data secure?", answer: "Yes, we use bank-level encryption and are SOC 2 Type II certified. All data is encrypted at rest and in transit.", category: "Security" },
  { id: "8", question: "Do you offer a free trial?", answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required.", category: "Billing" },
];

const CATEGORIES = ["All", "Getting Started", "Team", "Integrations", "Data", "Billing", "Security"];

export default function FAQPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFAQs = FAQS.filter((faq) => {
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
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" />
                <Input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {filteredFAQs.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="font-weight-medium text-h5-md mb-2">No Questions Found</Body>
              <Body className="text-grey-400">Try a different search term or category</Body>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="overflow-hidden">
                  <Button variant="ghost" className="w-full p-6 text-left flex items-center justify-between" onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}>
                    <div className="flex items-center gap-3">
                      <HelpCircle className="size-5 text-primary" />
                      <Body className="font-weight-medium">{faq.question}</Body>
                    </div>
                    {expandedId === faq.id ? <ChevronUp className="size-5 text-grey-400" /> : <ChevronDown className="size-5 text-grey-400" />}
                  </Button>
                  {expandedId === faq.id && (
                    <div className="px-6 pb-6 pt-0">
                      <Body className="text-grey-300 pl-8">{faq.answer}</Body>
                    </div>
                  )}
                </Card>
              ))}
            </div>
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
          <div className="space-y-6 mt-6">
            {CATEGORIES.filter((c) => c !== "All").map((category) => {
              const categoryFAQs = FAQS.filter((f) => f.category === category);
              return (
                <Card key={category} className="p-6">
                  <Body className="font-weight-bold text-h5-md mb-4">{category} ({categoryFAQs.length})</Body>
                  <div className="space-y-2">
                    {categoryFAQs.map((faq) => (
                      <Button key={faq.id} variant="ghost" className="w-full justify-start" onClick={() => { setSelectedCategory(category); setExpandedId(faq.id); }}>
                        <HelpCircle className="size-4 mr-2" />
                        {faq.question}
                      </Button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Help",
        title: "Frequently Asked Questions",
        description: "Find answers to common questions",
      }}
      backButton={{ label: "Help Center", href: "/help" }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/contact")}>Contact Support</Button>}
    />
  );
}
