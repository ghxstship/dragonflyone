"use client";

/**
 * Help Center Page
 * Support and help resources
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Book, MessageSquare, Video, FileText, Search, ExternalLink, List, Star } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  Input,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  articles: number;
}

const HELP_CATEGORIES: HelpCategory[] = [
  { id: "getting-started", title: "Getting Started", description: "Learn the basics of ATLVS", icon: <Book className="size-6" />, href: "/help/getting-started", articles: 12 },
  { id: "docs", title: "Documentation", description: "Comprehensive guides and reference", icon: <FileText className="size-6" />, href: "/help/docs", articles: 45 },
  { id: "tutorials", title: "Video Tutorials", description: "Step-by-step video guides", icon: <Video className="size-6" />, href: "/help/tutorials", articles: 20 },
  { id: "faq", title: "FAQ", description: "Frequently asked questions", icon: <HelpCircle className="size-6" />, href: "/help/faq", articles: 30 },
  { id: "community", title: "Community", description: "Connect with other users", icon: <MessageSquare className="size-6" />, href: "/help/community", articles: 0 },
  { id: "releases", title: "Release Notes", description: "Latest updates and changes", icon: <Star className="size-6" />, href: "/help/releases", articles: 15 },
];

const POPULAR_ARTICLES = [
  { title: "How to create a new project", href: "/help/articles/create-project" },
  { title: "Inviting team members", href: "/help/articles/invite-team" },
  { title: "Setting up integrations", href: "/help/articles/integrations" },
  { title: "Managing permissions", href: "/help/articles/permissions" },
  { title: "Exporting reports", href: "/help/articles/export-reports" },
];

export default function HelpPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCategories = HELP_CATEGORIES.filter((cat) => !search || cat.title.toLowerCase().includes(search.toLowerCase()) || cat.description.toLowerCase().includes(search.toLowerCase()));

  const tabs = [
    {
      id: "help",
      label: "Help Center",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-grey-400" />
              <Input placeholder="Search for help..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-12 font-weight-medium" />
            </div>
          </Card>

          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3 mb-8">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(category.href)}>
                <div className="p-3 bg-primary/20 rounded-card text-primary w-fit mb-4">{category.icon}</div>
                <Body className="font-weight-bold font-weight-medium mb-1">{category.title}</Body>
                <Body size="sm" className="text-grey-400 mb-2">{category.description}</Body>
                {category.articles > 0 && <Body size="sm" className="text-grey-500">{category.articles} articles</Body>}
              </Card>
            ))}
          </Grid>

          <Card className="p-6">
            <SectionHeader title="Popular Articles" />
            <div className="space-y-2 mt-4">
              {POPULAR_ARTICLES.map((article, idx) => (
                <Button key={idx} variant="ghost" className="w-full justify-between" onClick={() => router.push(article.href)}>
                  <div className="flex items-center gap-2"><FileText className="size-4" />{article.title}</div>
                  <ExternalLink className="size-4" />
                </Button>
              ))}
            </div>
          </Card>
        </Section>
      ),
    },
    {
      id: "contact",
      label: "Contact Support",
      icon: <MessageSquare className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Need More Help?" description="Our support team is here to assist you" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="p-6">
              <MessageSquare className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold font-weight-medium mb-2">Live Chat</Body>
              <Body className="text-grey-400 mb-4">Chat with our support team in real-time</Body>
              <Button variant="solid">Start Chat</Button>
            </Card>
            <Card className="p-6">
              <FileText className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold font-weight-medium mb-2">Submit a Ticket</Body>
              <Body className="text-grey-400 mb-4">Create a support ticket for complex issues</Body>
              <Button variant="outline" onClick={() => router.push("/contact")}>Create Ticket</Button>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Support",
        title: "Help Center",
        description: "Find answers and get support",
      }}
      tabs={tabs}
    />
  );
}
