'use client';

import { useState } from "react";
import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H2,
  H3,
  Label,
  Container,
  Display,
  Button,
  Badge,
  Input,
  FullBleedSection,
} from "@ghxstship/ui";
import { 
  HelpCircle, 
  ArrowRight, 
  Search, 
  ChevronDown,
  ChevronUp,
  DollarSign,
  Users,
  Settings,
  Shield,
  Zap,
} from "lucide-react";
import NextLink from "next/link";

const faqCategories = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "billing", label: "Billing & Plans", icon: DollarSign },
  { id: "features", label: "Features", icon: Zap },
  { id: "team", label: "Team & Access", icon: Users },
  { id: "integrations", label: "Integrations", icon: Settings },
  { id: "security", label: "Security", icon: Shield },
];

const faqItems = [
  {
    id: "1",
    category: "billing",
    question: "How do I upgrade or downgrade my plan?",
    answer: "You can change your plan at any time from Settings > Billing. When upgrading, you'll be charged a prorated amount for the remainder of your billing cycle. When downgrading, the change takes effect at the start of your next billing cycle. All your data is preserved during plan changes.",
  },
  {
    id: "2",
    category: "billing",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and ACH bank transfers for annual plans. Enterprise customers can also pay via invoice with NET-30 terms. All payments are processed securely through Stripe.",
  },
  {
    id: "3",
    category: "billing",
    question: "Can I get a refund if I'm not satisfied?",
    answer: "Yes! We offer a 30-day money-back guarantee for all new subscriptions. If you're not completely satisfied within the first 30 days, contact our support team for a full refund. No questions asked.",
  },
  {
    id: "4",
    category: "features",
    question: "How many productions can I create?",
    answer: "The number of productions depends on your plan. Starter plans include 3 active productions, Professional plans include 10, and Enterprise plans have unlimited productions. Archived productions don't count toward your limit.",
  },
  {
    id: "5",
    category: "features",
    question: "Can I export my data from ATLVS?",
    answer: "Absolutely! You can export all your data at any time. Go to Settings > Data Export to download your productions, budgets, schedules, and contacts in CSV or JSON format. We believe your data belongs to you.",
  },
  {
    id: "6",
    category: "features",
    question: "Is there a mobile app available?",
    answer: "ATLVS is fully responsive and works great on mobile browsers. We also have native iOS and Android apps available for download. The mobile apps support all core features including schedule viewing, expense submission, and notifications.",
  },
  {
    id: "7",
    category: "team",
    question: "How do I invite team members to my organization?",
    answer: "Go to Team > Invite Members and enter their email addresses. You can assign roles (Admin, Manager, Member, or Viewer) which determine their permissions. Invitees will receive an email with instructions to join your organization.",
  },
  {
    id: "8",
    category: "team",
    question: "Can I have different permission levels for different productions?",
    answer: "Yes! ATLVS supports both organization-level and production-level permissions. You can give someone Admin access to one production while limiting them to Viewer access on another. This is managed in each production's Team settings.",
  },
  {
    id: "9",
    category: "team",
    question: "How many team members can I add?",
    answer: "Team member limits vary by plan. Starter includes 5 members, Professional includes 25, and Enterprise has unlimited team members. You can also add external collaborators (like vendors or clients) who don't count toward your limit.",
  },
  {
    id: "10",
    category: "integrations",
    question: "What integrations do you support?",
    answer: "ATLVS integrates with Google Calendar, Outlook, Slack, QuickBooks, Xero, Dropbox, Google Drive, and many more. We also have a robust API for custom integrations. Check our Integrations page for the full list.",
  },
  {
    id: "11",
    category: "integrations",
    question: "How do I connect my calendar?",
    answer: "Go to Settings > Integrations > Calendar and click 'Connect' next to your calendar provider. You'll be prompted to authorize ATLVS. Once connected, your production schedules will sync automatically with your calendar.",
  },
  {
    id: "12",
    category: "integrations",
    question: "Can I use ATLVS with my existing accounting software?",
    answer: "Yes! We integrate with QuickBooks, Xero, and FreshBooks. Expenses and invoices can be synced automatically, eliminating double-entry. Set up the integration in Settings > Integrations > Accounting.",
  },
  {
    id: "13",
    category: "security",
    question: "Is my data secure?",
    answer: "Security is our top priority. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're SOC 2 Type II certified and undergo regular security audits. Our infrastructure is hosted on AWS with enterprise-grade security.",
  },
  {
    id: "14",
    category: "security",
    question: "Do you offer two-factor authentication?",
    answer: "Yes! We strongly recommend enabling 2FA for all accounts. Go to Settings > Security > Two-Factor Authentication to set it up. We support authenticator apps (Google Authenticator, Authy) and SMS verification.",
  },
  {
    id: "15",
    category: "security",
    question: "Where is my data stored?",
    answer: "Your data is stored in secure AWS data centers. US customers' data is stored in US-East, EU customers in EU-West (Ireland), and we offer data residency options for Enterprise customers with specific compliance requirements.",
  },
];

function FAQItem({ item, isOpen, onToggle }: { 
  item: typeof faqItems[0]; 
  isOpen: boolean; 
  onToggle: () => void;
}) {
  return (
    <Card 
      className={`border-2 transition-all ${isOpen ? "border-primary" : "border-grey-200"}`}
    >
      <Button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <Body className="font-weight-semibold text-ink-950 pr-4">{item.question}</Body>
        {isOpen ? (
          <ChevronUp className="size-5 shrink-0 text-primary" />
        ) : (
          <ChevronDown className="size-5 shrink-0 text-grey-400" />
        )}
      </Button>
      {isOpen && (
        <Stack className="border-t border-grey-200 p-4">
          <Body className="text-grey-600">{item.answer}</Body>
        </Stack>
      )}
    </Card>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const categoryIcon = faqCategories.find(c => c.id === activeCategory)?.icon || HelpCircle;
  const CategoryIcon = categoryIcon;

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <HelpCircle className="size-10 text-brand-pink" />
            </Stack>
            <Display size="lg" className="text-white">
              FREQUENTLY ASKED QUESTIONS
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Find answers to common questions about ATLVS. Can&apos;t find what 
              you&apos;re looking for? Contact our support team.
            </Body>

            {/* Search */}
            <Stack direction="horizontal" gap={0} className="w-full max-w-2xl">
              <Stack className="relative flex-1">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-grey-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-2 border-r-0 border-white bg-ink-900 pl-12 text-white placeholder:text-grey-500"
                />
              </Stack>
              <Button variant="pop" size="md">
                Search
              </Button>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* FAQ Content */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={8} className="sm:grid-cols-2 lg:grid-cols-4">
            {/* Category Sidebar */}
            <Stack gap={4} className="col-span-1">
              <H3 className="text-ink-950">CATEGORIES</H3>
              <Stack gap={2}>
                {faqCategories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-3 rounded-card border-2 p-3 text-left transition-all ${
                      activeCategory === category.id
                        ? "border-primary bg-primary/5"
                        : "border-grey-200 hover:border-grey-300"
                    }`}
                  >
                    <category.icon className={`size-5 ${
                      activeCategory === category.id ? "text-primary" : "text-grey-500"
                    }`} />
                    <Body size="sm" className={
                      activeCategory === category.id ? "font-weight-semibold text-primary" : "text-grey-700"
                    }>
                      {category.label}
                    </Body>
                  </Button>
                ))}
              </Stack>

              {/* Quick Links */}
              <Card className="mt-4 border-2 border-grey-200 p-4">
                <Stack gap={3}>
                  <Label size="xs" className="text-grey-500">QUICK LINKS</Label>
                  <NextLink href="/help/docs" className="text-body-sm text-primary hover:underline">
                    Documentation
                  </NextLink>
                  <NextLink href="/help/tutorials" className="text-body-sm text-primary hover:underline">
                    Video Tutorials
                  </NextLink>
                  <NextLink href="/contact" className="text-body-sm text-primary hover:underline">
                    Contact Support
                  </NextLink>
                </Stack>
              </Card>
            </Stack>

            {/* FAQ List */}
            <Stack gap={6} className="col-span-3">
              <Stack direction="horizontal" className="items-center justify-between">
                <Stack direction="horizontal" gap={3} className="items-center">
                  <CategoryIcon className="size-6 text-primary" />
                  <H2 className="text-ink-950">
                    {faqCategories.find(c => c.id === activeCategory)?.label || "All Questions"}
                  </H2>
                </Stack>
                <Badge variant="outline">{filteredFaqs.length} questions</Badge>
              </Stack>

              {filteredFaqs.length === 0 ? (
                <Card className="border-2 border-grey-200 p-8 text-center">
                  <Stack gap={4} className="items-center">
                    <Search className="size-12 text-grey-300" />
                    <Body className="text-grey-500">
                      No questions found matching your search. Try a different term or category.
                    </Body>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}>
                      Clear Filters
                    </Button>
                  </Stack>
                </Card>
              ) : (
                <Stack gap={3}>
                  {filteredFaqs.map((item) => (
                    <FAQItem
                      key={item.id}
                      item={item}
                      isOpen={openItems.includes(item.id)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Still Need Help */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <H2 className="text-white">STILL HAVE QUESTIONS?</H2>
            <Body size="lg" className="text-on-dark-secondary">
              Our support team is available 24/7 to help you with any questions 
              not covered in the FAQ.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="pop" size="lg">
                  Contact Support
                </Button>
              </NextLink>
              <NextLink href="/help">
                <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                  Help Center
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
