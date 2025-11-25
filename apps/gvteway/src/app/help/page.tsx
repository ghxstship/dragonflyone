"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Navigation,
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
  SectionLayout,
  Container,
  Stack,
  Link,
} from "@ghxstship/ui";

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
      header={
        <Navigation
          logo={<Display size="md" className="text-[3rem]">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/auth/signin')}>SIGN IN</Button>}
        >
          <Link href="/" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Home</Link>
          <Link href="/events" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Events</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-[3rem]">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES."
        >
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/contact">Contact Us</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container size="lg">
          <Stack gap={8}>
            <Stack gap={2}>
              <H2 className="text-white">Help Center</H2>
              <Body className="text-grey-400">
                Find answers to frequently asked questions and get support
              </Body>
            </Stack>

            <Stack gap={4} direction="horizontal">
              <Input
                type="search"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-grey-700 bg-black text-white"
              />
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-black text-white border-grey-700"
              >
                <option value="all">All Topics</option>
                <option value="tickets">Tickets</option>
                <option value="refunds">Refunds</option>
                <option value="access">Access</option>
              </Select>
            </Stack>

            <Stack gap={4}>
              <H3 className="text-white">Frequently Asked Questions</H3>
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="border-2 border-grey-800 p-6 bg-black">
                  <Stack gap={3}>
                    <Body className="font-display text-lg text-white">{faq.question}</Body>
                    <Body className="text-grey-300">{faq.answer}</Body>
                    <Body className="text-sm text-grey-500">Category: {faq.category}</Body>
                  </Stack>
                </Card>
              ))}
            </Stack>

            <Card className="border-2 border-grey-800 p-8 text-center bg-black">
              <Stack gap={4} className="items-center">
                <H3 className="text-white">Still need help?</H3>
                <Body className="text-grey-400">Our support team is here to assist you</Body>
                <Stack gap={4} direction="horizontal" className="justify-center">
                  <Button variant="solid" onClick={() => router.push('/contact')}>Contact Support</Button>
                  <Button variant="outline" onClick={() => window.open('https://support.gvteway.com/chat', '_blank')}>Live Chat</Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
