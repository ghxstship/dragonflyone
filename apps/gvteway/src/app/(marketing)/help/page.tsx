"use client";

/**
 * Help Center Page - GVTEWAY - 2026 Landing Page Best Practices
 * Central hub for support resources
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 * Content sourced from centralized marketing-content configuration
 */

import { useRouter } from "next/navigation";
import { HelpCircle, MessageSquare, FileText, Phone, Clock, Shield, Zap } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container,
  Body, Button, Card, Grid, Stack, Box,
  type FeatureItem
} from "@ghxstship/ui";
import { getFAQsByPlatform } from "@ghxstship/config/marketing-content";

const FAQ_COUNT = getFAQsByPlatform('gvteway').length;

const SUPPORT_OPTIONS: FeatureItem[] = [
  { id: "faq", icon: <HelpCircle className="size-8" />, title: "FAQ", description: `${FAQ_COUNT} answers to common questions about tickets and events.` },
  { id: "chat", icon: <MessageSquare className="size-8" />, title: "Live Chat", description: "Chat with our support team in real-time for quick help." },
  { id: "docs", icon: <FileText className="size-8" />, title: "Documentation", description: "Browse our comprehensive help articles and guides." },
  { id: "phone", icon: <Phone className="size-8" />, title: "Phone Support", description: "Call us at 1-800-GVTEWAY for immediate assistance." },
];

const STATS = [
  { value: "24/7", label: "Support" },
  { value: "<5min", label: "Response Time" },
  { value: "98%", label: "Satisfaction" },
  { value: `${FAQ_COUNT}+`, label: "FAQ Articles" },
];

const HELP_FEATURES: FeatureItem[] = [
  { id: "fast", icon: <Zap className="size-8" />, title: "Fast Response", description: "Get answers quickly with our responsive support team." },
  { id: "available", icon: <Clock className="size-8" />, title: "Always Available", description: "Support available 24/7, whenever you need help." },
  { id: "secure", icon: <Shield className="size-8" />, title: "Secure Support", description: "Your data and privacy are always protected." },
];

export default function HelpPage() {
  const router = useRouter();

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
              kicker="Support"
              title="Help Center"
              description="Get the help you need. Find answers, chat with support, or browse our documentation."
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/support/chat"),
              }}
              secondaryCta={{
                label: "Browse FAQ",
                onClick: () => router.push("/help/faq"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "stats",
          background: "primary",
          content: (
            <Container size="2xl" className="py-12">
              <Grid cols={4} gap={8} className="grid-cols-2 md:grid-cols-4">
                {STATS.map((stat, idx) => (
                  <Stack key={idx} gap={1} className="text-center">
                    <Body className="text-white font-weight-bold text-h3-md">{stat.value}</Body>
                    <Body className="text-white/80">{stat.label}</Body>
                  </Stack>
                ))}
              </Grid>
            </Container>
          ),
        },
        {
          id: "options",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Support</Body>
                  <Body className="text-white font-weight-bold text-h3-md">How Can We Help?</Body>
                  <Body className="text-on-dark-muted">Choose the support option that works best for you</Body>
                </Stack>

                <Grid cols={4} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {SUPPORT_OPTIONS.map((option) => (
                    <Card 
                      key={option.id} 
                      className="p-6 border-2 border-grey-800 rounded-card pop-card text-center cursor-pointer"
                      onClick={() => {
                        if (option.id === "faq") router.push("/help/faq");
                        else if (option.id === "chat") router.push("/support/chat");
                        else if (option.id === "docs") router.push("/help/docs");
                        else if (option.id === "phone") window.location.href = "tel:1-800-GVTEWAY";
                      }}
                    >
                      <Box className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4">
                        {option.icon}
                      </Box>
                      <Body className="text-white font-weight-bold mb-2">{option.title}</Body>
                      <Body size="sm" className="text-on-dark-muted">{option.description}</Body>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "features",
          background: "black",
          content: (
            <FeatureGrid
              kicker="Why Choose Us"
              title="Support You Can Trust"
              description="We are committed to providing the best support experience"
              features={HELP_FEATURES}
              columns={3}
              variant="bordered"
              background="black"
              align="center"
            />
          ),
        },
        {
          id: "contact",
          background: "ink",
          content: (
            <Container size="2xl" className="py-20">
              <Card className="p-8 border-2 border-grey-800 rounded-card">
                <Box className="flex items-center justify-between flex-wrap gap-6">
                  <Box className="flex items-center gap-4">
                    <Box className="p-4 bg-primary/20 rounded-card">
                      <Phone className="size-8 text-primary" />
                    </Box>
                    <Box>
                      <Body className="text-white font-weight-bold text-h4-md">Need Immediate Help?</Body>
                      <Body className="text-on-dark-muted">Call us at 1-800-GVTEWAY</Body>
                    </Box>
                  </Box>
                  <Button variant="solid" onClick={() => window.location.href = "tel:1-800-GVTEWAY"}>Call Now</Button>
                </Box>
              </Card>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Ready to Get Started?"
              description="Browse events, buy tickets, and enjoy amazing experiences with GVTEWAY."
              primaryCta={{
                label: "Browse Events",
                onClick: () => router.push("/events"),
              }}
              secondaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/support/chat"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
