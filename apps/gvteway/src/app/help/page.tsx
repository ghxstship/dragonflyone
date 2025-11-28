"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Input,
  Select,
  Card,
  Section,
  Container,
  Stack,
  Kicker,
  Label,
} from "@ghxstship/ui";
import { Search, HelpCircle, MessageCircle, Mail } from "lucide-react";

const faqs = [
  { id: 1, question: "How do I purchase tickets?", answer: "Browse events, select your tickets, and complete checkout with your payment method.", category: "Tickets" },
  { id: 2, question: "What is the refund policy?", answer: "Refunds are available up to 48 hours before the event. Processing takes 5-7 business days.", category: "Refunds" },
  { id: 3, question: "Can I transfer my tickets?", answer: "Yes, you can transfer tickets to friends through your account dashboard.", category: "Tickets" },
  { id: 4, question: "How do I access my tickets?", answer: "Tickets are available in your account and sent via email. Show the QR code at the venue.", category: "Access" },
];

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/help#contact">Contact</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={4}>
              <Kicker colorScheme="on-dark">Support</Kicker>
              <H2 size="lg" className="text-white">Help Center</H2>
              <Body className="max-w-2xl text-on-dark-muted">
                Find answers to frequently asked questions and get support
              </Body>
            </Stack>

            {/* Search & Filter */}
            <Card className="border-2 border-ink-800 bg-ink-950 p-6 shadow-primary">
              <Stack gap={4} direction="horizontal" className="flex-col md:flex-row">
                <Stack gap={2} className="flex-1">
                  <Label size="xs" className="text-on-dark-muted">
                    <Search className="mr-2 inline size-4" />
                    Search
                  </Label>
                  <Input
                    type="search"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    inverted
                  />
                </Stack>
                <Stack gap={2} className="md:w-48">
                  <Label size="xs" className="text-on-dark-muted">
                    <HelpCircle className="mr-2 inline size-4" />
                    Category
                  </Label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    inverted
                  >
                    <option value="all">All Topics</option>
                    <option value="tickets">Tickets</option>
                    <option value="refunds">Refunds</option>
                    <option value="access">Access</option>
                  </Select>
                </Stack>
              </Stack>
            </Card>

            {/* FAQs */}
            <Stack gap={6}>
              <H3 className="text-white">Frequently Asked Questions</H3>
              <Stack gap={4}>
                {filteredFAQs.map((faq) => (
                  <Card 
                    key={faq.id} 
                    className="border-2 border-ink-800 bg-ink-950 p-6 shadow-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-white hover:shadow-primary"
                  >
                    <Stack gap={3}>
                      <Body className="font-display text-white">{faq.question}</Body>
                      <Body className="text-on-dark-muted">{faq.answer}</Body>
                      <Label size="xs" className="text-on-dark-disabled">
                        Category: {faq.category}
                      </Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>

            {/* Contact CTA */}
            <Card className="border-4 border-ink-700 bg-ink-950 p-12 text-center shadow-xl">
              <Stack gap={6} className="mx-auto max-w-xl items-center">
                <H3 className="text-white">Still need help?</H3>
                <Body className="text-on-dark-muted">
                  Our support team is here to assist you with any questions
                </Body>
                <Stack gap={4} direction="horizontal" className="flex-col justify-center md:flex-row">
                  <Button 
                    variant="solid" 
                    inverted
                    icon={<Mail className="size-4" />}
                    iconPosition="left"
                    onClick={() => router.push('/contact')}
                    className="shadow-md transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Contact Support
                  </Button>
                  <Button 
                    variant="outlineInk"
                    icon={<MessageCircle className="size-4" />}
                    iconPosition="left"
                    onClick={() => window.open('https://support.gvteway.com/chat', '_blank')}
                    className="border-2 shadow-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Live Chat
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
