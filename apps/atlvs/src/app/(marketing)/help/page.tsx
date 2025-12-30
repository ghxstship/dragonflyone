"use client";

/**
 * Help Center Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, search, categories, and support options
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Book, MessageSquare, Video, FileText, Search, ArrowRight, Mail, Phone, Headphones } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Input} from "@ghxstship/ui";

const HELP_CATEGORIES: FeatureItem[] = [
  { id: "getting-started", icon: <Book className="size-8" />, title: "Getting Started", description: "Learn the basics of ATLVS with our beginner-friendly guides and tutorials." },
  { id: "docs", icon: <FileText className="size-8" />, title: "Documentation", description: "Comprehensive technical documentation and API reference for developers." },
  { id: "tutorials", icon: <Video className="size-8" />, title: "Video Tutorials", description: "Step-by-step video guides covering all features and workflows." },
  { id: "faq", icon: <HelpCircle className="size-8" />, title: "FAQ", description: "Answers to frequently asked questions about ATLVS and production management." },
  { id: "community", icon: <MessageSquare className="size-8" />, title: "Community", description: "Connect with other users, share tips, and get peer support." },
  { id: "releases", icon: <FileText className="size-8" />, title: "Release Notes", description: "Stay up to date with the latest features, improvements, and fixes." },
];

const POPULAR_ARTICLES = [
  { id: "1", title: "How to create a new project", description: "Learn the basics of project creation", href: "/help/articles/create-project", category: "Getting Started" },
  { id: "2", title: "Inviting team members", description: "Add collaborators to your projects", href: "/help/articles/invite-team", category: "Team Management" },
  { id: "3", title: "Setting up integrations", description: "Connect ATLVS with your tools", href: "/help/articles/integrations", category: "Integrations" },
  { id: "4", title: "Managing permissions", description: "Control access and roles", href: "/help/articles/permissions", category: "Security" },
  { id: "5", title: "Exporting reports", description: "Generate and download reports", href: "/help/articles/export-reports", category: "Reports" },
  { id: "6", title: "Keyboard shortcuts", description: "Work faster with shortcuts", href: "/help/articles/shortcuts", category: "Tips" },
];

const SUPPORT_OPTIONS = [
  { id: "chat", title: "Live Chat", description: "Chat with our support team in real-time. Average response time: 2 minutes.", icon: <Headphones className="size-8" />, action: "Start Chat", available: true },
  { id: "email", title: "Email Support", description: "Send us an email and we will respond within 24 hours.", icon: <Mail className="size-8" />, action: "Send Email", available: true },
  { id: "phone", title: "Phone Support", description: "Call us directly for urgent issues. Available for Enterprise plans.", icon: <Phone className="size-8" />, action: "Call Now", available: false },
];

export default function HelpPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredArticles = POPULAR_ARTICLES.filter((article) => 
    !search || 
    article.title.toLowerCase().includes(search.toLowerCase()) || 
    article.description.toLowerCase().includes(search.toLowerCase()) ||
    article.category.toLowerCase().includes(search.toLowerCase())
  );

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
              title="How Can We Help?"
              description="Find answers, browse documentation, watch tutorials, or contact our support team."
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
            <Container size="lg" className="py-12">
              <Card className="p-6 border-2 border-grey-800 rounded-card">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-dark-muted" />
                  <Input
                    placeholder="Search for help articles, guides, and documentation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-14 text-body-lg"
                  />
                </div>
              </Card>
            </Container>
          ),
        },
        {
          id: "categories",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Browse by Topic"
              title="Help Categories"
              description="Find the help you need by category"
              features={HELP_CATEGORIES}
              columns={3}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "popular",
          background: "black",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Quick Answers</Body>
                  <H3 className="text-white">Popular Articles</H3>
                  <Body className="text-on-dark-muted max-w-2xl">The most frequently viewed help articles by our users.</Body>
                </Stack>

                <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                  {filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="p-5 border-2 border-grey-800 rounded-card cursor-pointer hover:border-primary/50 transition-all group"
                      onClick={() => router.push(article.href)}
                    >
                      <Stack direction="horizontal" className="justify-between items-center gap-4">
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <div className="p-2 bg-grey-800 rounded-card group-hover:bg-primary/20 transition-all">
                            <FileText className="size-5 text-on-dark-muted group-hover:text-primary transition-colors" />
                          </div>
                          <Stack gap={0}>
                            <Body className="text-white font-weight-bold group-hover:text-primary transition-colors">{article.title}</Body>
                            <Body size="sm" className="text-on-dark-disabled">{article.category}</Body>
                          </Stack>
                        </Stack>
                        <ArrowRight className="size-5 text-on-dark-disabled group-hover:text-primary transition-colors" />
                      </Stack>
                    </Card>
                  ))}
                </Grid>

                {search && filteredArticles.length === 0 && (
                  <Card className="p-8 text-center border-2 border-grey-800 rounded-card">
                    <HelpCircle className="size-12 text-on-dark-disabled mx-auto mb-4" />
                    <Body className="text-white font-weight-medium mb-2">No Articles Found</Body>
                    <Body className="text-on-dark-muted mb-4">Try a different search term or browse by category</Body>
                    <Button variant="outline" onClick={() => setSearch("")}>Clear Search</Button>
                  </Card>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "support",
          background: "ink",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Contact Us</Body>
                  <H3 className="text-white">Need More Help?</H3>
                  <Body className="text-on-dark-muted max-w-2xl">Our support team is here to assist you with any questions or issues.</Body>
                </Stack>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                  {SUPPORT_OPTIONS.map((option) => (
                    <Card key={option.id} className={`p-6 border-2 rounded-card ${option.available ? "border-grey-800 hover:border-primary/50" : "border-grey-900 opacity-60"} transition-all`}>
                      <Stack gap={4} className="items-center text-center">
                        <div className={`p-4 rounded-card ${option.available ? "bg-primary/20 text-primary" : "bg-grey-800 text-on-dark-disabled"}`}>
                          {option.icon}
                        </div>
                        <Stack gap={2} className="items-center">
                          <Body className="text-white font-weight-bold">{option.title}</Body>
                          <Body size="sm" className="text-on-dark-muted">{option.description}</Body>
                        </Stack>
                        <Button
                          variant={option.available ? "solid" : "outline"}
                          disabled={!option.available}
                          onClick={() => option.id === "email" ? router.push("/contact") : undefined}
                        >
                          {option.action}
                        </Button>
                      </Stack>
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
              title="Still Have Questions?"
              description="Browse our comprehensive documentation or reach out to our team for personalized assistance."
              primaryCta={{
                label: "View Documentation",
                onClick: () => router.push("/docs"),
              }}
              secondaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
